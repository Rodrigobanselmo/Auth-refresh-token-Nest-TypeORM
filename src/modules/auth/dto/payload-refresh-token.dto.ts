import { IsEmail, IsString } from 'class-validator';

export class PayloadRefreshTokenDto {
  @IsString()
  readonly sub: number | string;

  @IsString()
  @IsEmail()
  readonly email: string;
}
