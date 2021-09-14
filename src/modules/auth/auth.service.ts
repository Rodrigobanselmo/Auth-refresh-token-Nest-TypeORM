import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login-user.dto';
import { HashProvider } from 'src/shared/providers/HashProvider/implementations/HashProvider';
import { classToClass } from 'class-transformer';
import { PayloadTokenDto } from './dto/payload-token.dto';
import { PayloadRefreshTokenDto } from './dto/payload-refresh-token.dto';
import { UserTokensRepository } from './repositories/implementations/UsersTokensRepository';

@Injectable()
export class AuthService {
  constructor(
    private readonly userTokensRepository: UserTokensRepository,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly hashProvider: HashProvider,
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
    const newRefreshToken = await this.userTokensRepository.create(
      user.id,
      payload,
    );

    return {
      token,
      refresh_token: newRefreshToken.refresh_token,
      user: classToClass(user),
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
          secret: process.env.REFRESH_TOKEN_SECRET,
        },
      );

      const user_id = Number(sub);
      const userRefreshToken =
        await this.userTokensRepository.findByUserIdAndRefreshToken(
          user_id,
          refresh_token,
        );

      if (!userRefreshToken) {
        throw new UnauthorizedException('Refresh Token does not exists!');
      }

      const user = await this.usersService.findById(user_id);

      if (!user) {
        throw new NotFoundException('User does not exists!');
      }

      const payload: PayloadRefreshTokenDto = {
        sub: user.id,
        email: user.email,
        permissions: [],
        roles: [],
      };

      const token = this.jwtService.sign(payload);
      const newRefreshToken = await this.userTokensRepository.create(
        user.id,
        payload,
      );
      await this.userTokensRepository.deleteById(userRefreshToken.id);

      return {
        refresh_token: newRefreshToken.refresh_token,
        token: token,
        user: classToClass(user),
      };
    } catch (err) {
      if (err.message === 'jwt expired') {
        await this.userTokensRepository.deleteByRefreshToken(refresh_token);
      }
      throw new UnauthorizedException(err.message);
    }
  }

  async deleteAllExpiredRefreshTokens() {
    return this.userTokensRepository.deleteAll();
  }
}
