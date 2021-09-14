import { IsEmail, IsString } from 'class-validator';

export class UserPayloadDto {
  @IsString()
  readonly user_id: number;

  @IsString()
  @IsEmail()
  readonly email: string;

  @IsString({ each: true })
  readonly roles: string[];

  @IsString({ each: true })
  readonly permissions: string[];
}
