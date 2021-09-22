import { RefreshTokenEntity } from 'src/modules/auth/entities/refresh-tokens.entity';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DayJSProvider } from 'src/shared/providers/DateProvider/implementations/DayJSProvider';
import { PayloadRefreshTokenDto } from '../../dto/payload-refresh-token.dto';
import { IUsersTokensRepository } from '../IUsersTokensRepository';
import { RefreshTokenDto } from '../../dto/refresh-token.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserTokensRepository implements IUsersTokensRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly dateProvider: DayJSProvider,
  ) {}

  async create(userId: number, payload: PayloadRefreshTokenDto) {
    const dateNow = this.dateProvider.dateNow();
    const expiresRefreshTokenDays =
      Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS) || 1;

    const refreshTokenExpiresDate = this.dateProvider.addDay(
      dateNow,
      expiresRefreshTokenDays,
    );

    const refresh_token = this.jwtService.sign(payload, {
      secret: process.env.REFRESH_TOKEN_SECRET,
      expiresIn: `${process.env.REFRESH_TOKEN_EXPIRES_DAYS}d`,
    });

    return this.prisma.refreshToken.create({
      data: {
        refresh_token,
        expires_date: refreshTokenExpiresDate,
        userId,
      },
    });
  }

  async findByUserIdAndRefreshToken(userId: number, refresh_token: string) {
    const userTokens = await this.prisma.refreshToken.findFirst({
      where: { userId, refresh_token },
    });
    if (!userTokens) return userTokens;

    return userTokens;
  }

  async findByRefreshToken(refresh_token: string) {
    const userTokens = await this.prisma.refreshToken.findFirst({
      where: { refresh_token },
    });
    if (!userTokens) return userTokens;

    return userTokens;
  }

  async deleteById(id: string) {
    await this.prisma.refreshToken.delete({ where: { id } });
  }

  async deleteAll() {
    const currentDate = this.dateProvider.dateNow();

    const deletedResult = await this.prisma.refreshToken.deleteMany({
      where: {
        expires_date: {
          lte: currentDate,
        },
      },
    });

    return deletedResult;
  }

  async deleteByRefreshToken(refresh_token: string) {
    await this.prisma.refreshToken.deleteMany({ where: { refresh_token } });
  }
}
