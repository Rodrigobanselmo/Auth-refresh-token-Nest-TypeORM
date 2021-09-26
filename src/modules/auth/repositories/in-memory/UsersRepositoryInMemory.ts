import { Prisma, User } from '.prisma/client';
import { RefreshTokenEntity } from '../../entities/refresh-tokens.entity';
import { IUsersTokensRepository } from '../IUsersTokensRepository';

class UsersTokensRepositoryInMemory implements IUsersTokensRepository {
  create(
    refresh_token: string,
    userId: number,
    expires_date: Date,
  ): Promise<RefreshTokenEntity> {
    throw new Error('Method not implemented.');
  }
  findByRefreshToken(refresh_token: string): Promise<RefreshTokenEntity> {
    throw new Error('Method not implemented.');
  }
  findByUserIdAndRefreshToken(
    userId: number,
    refresh_token: string,
  ): Promise<RefreshTokenEntity> {
    throw new Error('Method not implemented.');
  }
  deleteById(id: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  deleteByRefreshToken(refresh_token: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  deleteAll(currentDate: Date): Promise<Prisma.BatchPayload> {
    throw new Error('Method not implemented.');
  }
  users: User[] = [];
}

export { UsersTokensRepositoryInMemory };
