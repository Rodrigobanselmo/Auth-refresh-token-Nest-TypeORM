import { UsersRepository } from './repositories/implementations/UsersRepository';
import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { HashProvider } from '../../shared/providers/HashProvider/implementations/HashProvider';

@Module({
  controllers: [UsersController],
  providers: [UsersService, HashProvider, UsersRepository],
  exports: [UsersService],
})
export class UsersModule {}
