import { UsersModule } from '../users/users.module';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { HashProvider } from '../../shared/providers/HashProvider/implementations/HashProvider';
import { DayJSProvider } from '../../shared/providers/DateProvider/implementations/DayJSProvider';
import { UserTokensRepository } from './repositories/implementations/UsersTokensRepository';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('TOKEN_SECRET'),
        signOptions: {
          expiresIn: `${configService.get<string>('TOKEN_EXPIRES_MIN')}m`,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    HashProvider,
    DayJSProvider,
    UserTokensRepository,
  ],
})
export class AuthModule {}
