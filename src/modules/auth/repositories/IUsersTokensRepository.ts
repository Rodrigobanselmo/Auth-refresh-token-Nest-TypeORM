import { UserToken } from 'src/modules/users/entities/user-tokens.entity';
import { DeleteResult } from 'typeorm';
import { PayloadRefreshTokenDto } from '../dto/payload-refresh-token.dto';

interface IUsersTokensRepository {
  create(user_id: number, payload: PayloadRefreshTokenDto): Promise<UserToken>;
  findByRefreshToken(refresh_token: string): Promise<UserToken | undefined>;
  findByUserIdAndRefreshToken(
    user_id: number,
    refresh_token: string,
  ): Promise<UserToken | undefined>;
  deleteById(id: string): Promise<void>;
  deleteByRefreshToken(refresh_token: string): Promise<void>;
  deleteAll(): Promise<DeleteResult>;
}
export { IUsersTokensRepository };
