import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ description: 'user refresh token' })
  @IsString()
  readonly refresh_token: string;
}
