import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../prisma/prisma.service';
import { IUsersTokensRepository } from '../IUsersTokensRepository';

@Injectable()
export class UserTokensRepository implements IUsersTokensRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(refresh_token: string, userId: number, expires_date: Date) {
    return this.prisma.refreshToken.create({
      data: {
        refresh_token,
        expires_date,
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

  async deleteAll(currentDate: Date) {
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
