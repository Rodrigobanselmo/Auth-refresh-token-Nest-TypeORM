import { IsEmail, IsString, Length, Min } from 'class-validator';

export class PayloadSessionDto {
  @IsString()
  @IsEmail()
  readonly email: string;

  @IsString()
  @Length(6)
  readonly password: string;
}
