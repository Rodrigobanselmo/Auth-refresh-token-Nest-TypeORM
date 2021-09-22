import { Prisma } from '.prisma/client';
import { RefreshTokenEntity } from 'src/modules/auth/entities/refresh-tokens.entity';
import { PayloadRefreshTokenDto } from '../dto/payload-refresh-token.dto';

interface IUsersTokensRepository {
  create(
    userId: number,
    payload: PayloadRefreshTokenDto,
  ): Promise<RefreshTokenEntity>;
  findByRefreshToken(
    refresh_token: string,
  ): Promise<RefreshTokenEntity | undefined>;
  findByUserIdAndRefreshToken(
    userId: number,
    refresh_token: string,
  ): Promise<RefreshTokenEntity | undefined>;
  deleteById(id: string): Promise<void>;
  deleteByRefreshToken(refresh_token: string): Promise<void>;
  deleteAll(): Promise<Prisma.BatchPayload>;
}
export { IUsersTokensRepository };
