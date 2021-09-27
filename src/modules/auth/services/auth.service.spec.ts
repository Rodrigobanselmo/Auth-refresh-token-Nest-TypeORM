import { newFakeUser } from './../../users/services/users.service.spec';
import { PayloadRefreshTokenDto } from './../dto/payload-refresh-token.dto';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';

import { DayJSProvider } from '../../../shared/providers/DateProvider/implementations/DayJSProvider';
import { HashProvider } from '../../../shared/providers/HashProvider/implementations/HashProvider';
import { UsersTokensRepositoryInMemory } from '../repositories/in-memory/UsersTokensRepositoryInMemory';
import { UsersRepository } from './../../users/repositories/implementations/UsersRepository';
import { UsersRepositoryInMemory } from './../../users/repositories/in-memory/UsersRepositoryInMemory';
import { UsersService } from './../../users/services/users.service';
import { UserTokensRepository } from './../repositories/implementations/UsersTokensRepository';
import { JwtStrategy } from './../strategies/jwt.strategy';
import { AuthService } from './auth.service';

//yarn test:watch -- auth.service
//yarn test -- auth.service

describe('AuthService', () => {
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
      providers: [
        AuthService,
        UsersService,
        HashProvider,
        JwtStrategy,
        DayJSProvider,
        ConfigService,
        {
          provide: UserTokensRepository,
          useClass: UsersTokensRepositoryInMemory,
        },
        {
          provide: UsersRepository,
          useClass: UsersRepositoryInMemory,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    userTokensRepository =
      module.get<UserTokensRepository>(UserTokensRepository);
    jwtService = module.get<JwtService>(JwtService);
    // service = await module.resolve(AuthService); // to use request
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
    expect(usersService).toBeDefined();
  });

  describe('Create session / login user', () => {
    it('should be able to login with email and password and return refreshToken, token and user', async () => {
      const user = newFakeUser();

      await usersService.create(user);

      const data = await authService.session({
        email: user.email,
        password: user.password,
      });
      expect(data).toHaveProperty('token');
      expect(data).toHaveProperty('refresh_token');
      expect(data.user).toHaveProperty('id');
    });
    it('should not be able to login with email that does not exists', async () => {
      try {
        await authService.session({
          email: 'fake@email.com',
          password: '123456',
        });
        throw new Error('error');
      } catch (err) {
        expect(err).toEqual(new NotFoundException('User not found'));
      }
    });

    it('should not be able to login with wrong password', async () => {
      const user = newFakeUser();
      await usersService.create(user);

      try {
        await authService.session({
          email: user.email,
          password: '123123',
        });
        throw new Error('error');
      } catch (err) {
        expect(err).toEqual(
          new BadRequestException('Email or password incorrect'),
        );
      }
    });
  });

  describe('Refresh Token', () => {
    it('should be able to refresh existent token and return a new token and refreshToken', async () => {
      const user = newFakeUser();
      await usersService.create(user);

      const session = await authService.session({
        email: user.email,
        password: user.password,
      });

      const data = await authService.refresh(session.refresh_token);

      expect(data).toHaveProperty('token');
      expect(data).toHaveProperty('refresh_token');
      expect(data.user).toHaveProperty('id');
    });

    it('should not be able to refresh the token if refresh token is not saved on database', async () => {
      const user = await usersService.create(newFakeUser());

      const payload: PayloadRefreshTokenDto = {
        sub: user.id,
        email: user.email,
      };

      const refresh_token = jwtService.sign(payload, {
        secret: process.env.REFRESH_TOKEN_SECRET || 'secret',
        expiresIn: `${process.env.REFRESH_TOKEN_EXPIRES_DAYS || 1}d`,
      });

      try {
        await authService.refresh(refresh_token);
        throw new Error('error');
      } catch (err) {
        expect(err).toEqual(
          new UnauthorizedException('Refresh Token does not exists!'),
        );
      }
    });

    it('should not be able to refresh the token if user does not exists', async () => {
      const payload: PayloadRefreshTokenDto = {
        sub: 123,
        email: 'fake@example.com',
      };

      const refresh_token = jwtService.sign(payload, {
        secret: process.env.REFRESH_TOKEN_SECRET || 'secret',
        expiresIn: `${process.env.REFRESH_TOKEN_EXPIRES_DAYS || 1}d`,
      });

      await userTokensRepository.create(refresh_token, 123, new Date());

      try {
        await authService.refresh(refresh_token);
        throw new Error('error');
      } catch (err) {
        expect(err).toEqual(new NotFoundException('User not found'));
      }
    });

    it('should not be able to refresh the token if refresh token is expired', async () => {
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

      const promise = new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve('');
        }, 1500);
      });

      try {
        await promise;
        await authService.refresh(refresh_token);
        throw new Error('error');
      } catch (err) {
        expect(err).toBeInstanceOf(UnauthorizedException);
      }
    });
  });
});
