import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DayJSProvider } from 'src/shared/providers/DateProvider/implementations/DayJSProvider';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserToken } from 'src/modules/users/entities/user-tokens.entity';
import { PayloadRefreshTokenDto } from '../../dto/payload-refresh-token.dto';
import { IUsersTokensRepository } from '../IUsersTokensRepository';

@Injectable()
export class UserTokensRepository implements IUsersTokensRepository {
  constructor(
    @InjectRepository(UserToken)
    private readonly userTokensRepository: Repository<UserToken>,
    private readonly jwtService: JwtService,
    private readonly dateProvider: DayJSProvider,
  ) {}

  async create(user_id: number, payload: PayloadRefreshTokenDto) {
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

    const usersToken = this.userTokensRepository.create({
      refresh_token,
      expires_date: refreshTokenExpiresDate,
      user_id,
    });

    return this.userTokensRepository.save(usersToken);
  }

  async findByUserIdAndRefreshToken(
    user_id: number,
    refresh_token: string,
  ): Promise<UserToken | undefined> {
    const userTokens = await this.userTokensRepository.findOne({
      user_id,
      refresh_token,
    });

    return userTokens;
  }

  async findByRefreshToken(
    refresh_token: string,
  ): Promise<UserToken | undefined> {
    const userTokens = await this.userTokensRepository.findOne({
      refresh_token,
    });

    return userTokens;
  }

  async deleteById(id: string) {
    await this.userTokensRepository.delete(id);
  }

  async deleteAll() {
    const currentDate = this.dateProvider.dateNow();
    console.log('currentDate', currentDate);
    const deletedResult = await this.userTokensRepository
      .createQueryBuilder()
      .delete()
      .where('expires_date <= :currentDate', {
        currentDate,
      })
      .execute();

    return deletedResult;
  }

  async deleteByRefreshToken(refresh_token: string) {
    await this.userTokensRepository.delete({ refresh_token });
  }
}
