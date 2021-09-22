import { RefreshToken } from '.prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenEntity implements RefreshToken {
  @ApiProperty()
  id: string;

  @ApiProperty()
  refresh_token: string;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  expires_date: Date;

  @ApiProperty()
  created_at: Date;

  constructor(partial: Partial<RefreshTokenEntity>) {
    Object.assign(this, partial);
  }
}
