import { DayJSProvider } from '../../../shared/providers/DateProvider/implementations/DayJSProvider';
import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../../users/services/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from '../dto/login-user.dto';
import { HashProvider } from '../../../shared/providers/HashProvider/implementations/HashProvider';
import { classToClass } from 'class-transformer';
import { PayloadTokenDto } from '../dto/payload-token.dto';
import { PayloadRefreshTokenDto } from '../dto/payload-refresh-token.dto';
import { UserTokensRepository } from '../repositories/implementations/UsersTokensRepository';
import { UserEntity } from '../../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userTokensRepository: UserTokensRepository,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly hashProvider: HashProvider,
    private readonly dateProvider: DayJSProvider,
  ) {}

  async session({ email, password }: LoginUserDto) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const passwordMatch = await this.hashProvider.compare(
      password,
      user.password,
    );

    if (!passwordMatch) {
      throw new BadRequestException('Email or password incorrect');
    }

    const payload = {
      email,
      sub: user.id,
      roles: user.roles,
      permissions: user.permissions,
    } as PayloadTokenDto;

    const token = this.jwtService.sign(payload);

    const newRefreshToken = await this.generateRefreshToken(user.id, payload);

    return {
      token,
      refresh_token: newRefreshToken.refresh_token,
      user: classToClass(new UserEntity(user)),
    };
  }

  async refresh(refresh_token: string) {
    if (!refresh_token) {
      throw new HttpException('Token not present!', 401);
    }
    try {
      const { sub }: PayloadRefreshTokenDto = this.jwtService.verify(
        refresh_token,
        {
          secret: process.env.REFRESH_TOKEN_SECRET || 'secret',
        },
      );

      const userId = Number(sub);
      const userRefreshToken =
        await this.userTokensRepository.findByUserIdAndRefreshToken(
          userId,
          refresh_token,
        );

      if (!userRefreshToken) {
        throw new UnauthorizedException('Refresh Token does not exists!');
      }

      const user = await this.usersService.findById(userId);

      const payload: PayloadRefreshTokenDto = {
        sub: user.id,
        email: user.email,
      };

      const token = this.jwtService.sign(payload);
      const newRefreshToken = await this.generateRefreshToken(user.id, payload);
      await this.userTokensRepository.deleteById(userRefreshToken.id);

      return {
        refresh_token: newRefreshToken.refresh_token,
        token: token,
        user: classToClass(new UserEntity(user)),
      };
    } catch (err) {
      if (err.message === 'jwt expired') {
        await this.userTokensRepository.deleteByRefreshToken(refresh_token);
      }
      throw new UnauthorizedException(err.message);
    }
  }

  async deleteAllExpiredRefreshTokens() {
    const currentDate = this.dateProvider.dateNow();
    return this.userTokensRepository.deleteAllOldTokens(currentDate);
  }

  async generateRefreshToken(userId: number, payload: PayloadRefreshTokenDto) {
    const dateNow = this.dateProvider.dateNow();
    const expiresRefreshTokenDays =
      Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS) || 1;

    const refreshTokenExpiresDate = this.dateProvider.addDay(
      dateNow,
      expiresRefreshTokenDays,
    );

    const refresh_token = this.jwtService.sign(payload, {
      secret: process.env.REFRESH_TOKEN_SECRET || 'secret',
      expiresIn: `${process.env.REFRESH_TOKEN_EXPIRES_DAYS || 1}d`,
    });

    const newRefreshToken = await this.userTokensRepository.create(
      refresh_token,
      userId,
      refreshTokenExpiresDate,
    );

    return newRefreshToken;
  }
}
