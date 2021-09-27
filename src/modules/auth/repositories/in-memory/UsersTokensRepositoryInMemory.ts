import { RefreshToken } from '.prisma/client';
import { RefreshTokenEntity } from '../../entities/refresh-tokens.entity';
import { IUsersTokensRepository } from '../IUsersTokensRepository';

class UsersTokensRepositoryInMemory implements IUsersTokensRepository {
  refreshTokens: RefreshToken[] = [];

  create(refresh_token: string, userId: number, expires_date: Date): any {
    const refreshToken: RefreshToken = {
      id: Math.random().toString(),
      refresh_token,
      expires_date,
      created_at: new Date(),
      userId,
    };

    this.refreshTokens.push(refreshToken);
    return refreshToken;
  }
  findByRefreshToken(refresh_token: string): any {
    const refreshToken = this.refreshTokens.find(
      (i) => i.refresh_token === refresh_token,
    );
    return refreshToken;
  }
  findByUserIdAndRefreshToken(userId: number, refresh_token: string): any {
    const refreshToken = this.refreshTokens.find(
      (i) => i.userId === userId && i.refresh_token === refresh_token,
    );
    return refreshToken;
  }
  deleteById(id: string): any {
    this.refreshTokens.splice(this.refreshTokens.findIndex((i) => i.id === id));
  }
  deleteByRefreshToken(refresh_token: string): any {
    this.refreshTokens.splice(
      this.refreshTokens.findIndex((i) => i.refresh_token === refresh_token),
    );
  }
  deleteAllOldTokens(currentDate: Date): any {
    this.refreshTokens
      .filter((refresh_token) => refresh_token.expires_date <= currentDate)
      .map((refresh_token) => {
        this.refreshTokens.splice(
          this.refreshTokens.findIndex((i) => i.id === refresh_token.id),
        );
      });
  }
}

export { UsersTokensRepositoryInMemory };
