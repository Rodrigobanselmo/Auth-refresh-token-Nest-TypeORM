import { UpdateUserDto } from './../../dto/update-user.dto';
import { CreateUserDto } from './../../dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { HashProvider } from 'src/shared/providers/HashProvider/implementations/HashProvider';
import { User } from '../../entities/user.entity';
import { IUsersRepository } from '../IUsersRepository';

@Injectable()
export class UsersRepository implements IUsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly hashProvider: HashProvider,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const user = this.userRepository.create({
      ...createUserDto,
    });
    return await this.userRepository.save(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.preload({
      id: +id,
      ...updateUserDto,
    });
    if (!user) {
      throw new NotFoundException(`user #${id} not found`);
    }
    return this.userRepository.save(user);
  }

  async removeById(id: number) {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException(`user #${id} not found`);
    }
    return this.userRepository.remove(user);
  }

  findAll() {
    return this.userRepository.find();
  }

  findByEmail(email: string) {
    return this.userRepository.findOne({ email });
  }

  findById(id: number) {
    return this.userRepository.findOne(id);
  }
}
