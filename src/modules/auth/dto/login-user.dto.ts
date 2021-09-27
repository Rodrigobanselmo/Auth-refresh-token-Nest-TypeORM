import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({ description: 'user email.' })
  @IsString()
  @IsEmail()
  readonly email: string;

  @ApiProperty({ description: 'user password.' })
  @IsString()
  @Length(6)
  readonly password: string;
}
