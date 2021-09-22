import { User } from '.prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class UserEntity implements User {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @Exclude()
  @ApiProperty()
  password: string;

  @ApiProperty()
  roles: string[];

  @ApiProperty()
  permissions: string[];

  @ApiProperty({ required: false, nullable: true })
  avatar: string | null;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  created_at: Date;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
