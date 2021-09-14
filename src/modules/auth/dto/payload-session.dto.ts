import { IsEmail, IsString, Length } from 'class-validator';

export class PayloadSessionDto {
  @IsString()
  @IsEmail()
  readonly email: string;

  @IsString()
  @Length(6)
  readonly password: string;
}
