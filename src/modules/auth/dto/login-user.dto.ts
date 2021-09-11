import { IsEmail, IsString, Length, Min } from 'class-validator';

export class LoginUserDto {
  @IsString()
  @IsEmail()
  readonly email: string;

  @IsString()
  @Length(6)
  readonly password: string;
}
