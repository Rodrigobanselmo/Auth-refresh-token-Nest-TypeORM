import { UsersRepository } from './repositories/implementations/UsersRepository';
import { User } from './entities/user.entity';
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HashProvider } from 'src/shared/providers/HashProvider/implementations/HashProvider';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService, HashProvider, UsersRepository],
  exports: [UsersService],
})
export class UsersModule {}
