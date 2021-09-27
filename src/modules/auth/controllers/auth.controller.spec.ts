import { PayloadRefreshTokenDto } from './../dto/payload-refresh-token.dto';
import { newFakeUser } from './../../users/services/users.service.spec';
import { LoginUserDto } from './../dto/login-user.dto';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';

import { UsersRepositoryInMemory } from '../../../modules/users/repositories/in-memory/UsersRepositoryInMemory';
import { DayJSProvider } from '../../../shared/providers/DateProvider/implementations/DayJSProvider';
import { HashProvider } from '../../../shared/providers/HashProvider/implementations/HashProvider';
import { UsersTokensRepositoryInMemory } from '../repositories/in-memory/UsersTokensRepositoryInMemory';
import { UsersRepository } from './../../users/repositories/implementations/UsersRepository';
import { UsersService } from './../../users/services/users.service';
import { UserTokensRepository } from './../repositories/implementations/UsersTokensRepository';
import { AuthService } from './../services/auth.service';
import { JwtStrategy } from './../strategies/jwt.strategy';
import { AuthController } from './auth.controller';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

describe('ConController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let usersService: UsersService;
  let userTokensRepository: UserTokensRepository;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule,
        JwtModule.registerAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => ({
            secret: configService.get<string>('TOKEN_SECRET'),
            signOptions: {
              expiresIn: `${configService.get<string>('TOKEN_EXPIRES_MIN')}m`,
            },
          }),
          inject: [ConfigService],
        }),
      ],
      controllers: [AuthController],
      providers: [
        AuthService,
        UsersService,
        HashProvider,
        JwtStrategy,
        DayJSProvider,
        ConfigService,
        {
          provide: UsersRepository,
          useClass: UsersRepositoryInMemory,
        },
        {
          provide: UserTokensRepository,
          useClass: UsersTokensRepositoryInMemory,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    userTokensRepository =
      module.get<UserTokensRepository>(UserTokensRepository);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('User create session', () => {
    it('should be able to create tokens with email and password', async () => {
      const user = await usersService.create(newFakeUser());
      const body: LoginUserDto = {
        email: user.email,
        password: '123456',
      };
      const response = await controller.session(body);

      expect(response).toHaveProperty('refresh_token');
    });

    it('should not be able to create user session with missing email or password', async () => {
      const user = await usersService.create(newFakeUser());
      const bodyMissingPassword = {
        email: user.email,
      } as LoginUserDto;
      const bodyMissingEmail = {
        password: '123456',
      } as LoginUserDto;

      try {
        await controller.session(bodyMissingPassword);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
      }
      try {
        await controller.session(bodyMissingEmail);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
      }
    });
  });

  describe('User Refresh Token', () => {
    it('should be able to refresh users token', async () => {
      const user = await usersService.create(newFakeUser());
      const body: LoginUserDto = {
        email: user.email,
        password: '123456',
      };
      const session = await controller.session(body);
      const response = await controller.refresh({
        refresh_token: session.refresh_token,
      });
      expect(response).toHaveProperty('refresh_token');
    });
  });

  it('should not be able to refresh token with missing token', async () => {
    try {
      await controller.refresh({} as { refresh_token: string });
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
    }
  });

  describe('Delete all expired refresh tokens', () => {
    it('should be able to delete all expired tokens from database', async () => {
      const user = await usersService.create(newFakeUser());

      const payload: PayloadRefreshTokenDto = {
        sub: user.id,
        email: user.email,
      };

      const refresh_token = jwtService.sign(payload, {
        secret: process.env.REFRESH_TOKEN_SECRET || 'secret',
        expiresIn: `1s`,
      });

      await userTokensRepository.create(refresh_token, user.id, new Date());

      const promise = new Promise((resolve) => {
        setTimeout(() => {
          resolve('');
        }, 1500);
      });

      try {
        await promise;
        await controller.deleteAll();
        await userTokensRepository.findByRefreshToken(refresh_token);
      } catch (err) {
        expect(err).toEqual(
          new UnauthorizedException('Refresh Token does not exists!'),
        );
      }
    });
  });
});
