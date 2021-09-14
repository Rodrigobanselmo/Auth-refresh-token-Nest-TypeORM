import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { HashProvider } from 'src/shared/providers/HashProvider/implementations/HashProvider';
import { classToClass } from 'class-transformer';
import { UsersRepository } from './repositories/implementations/UsersRepository';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UsersRepository,
    private readonly hashProvider: HashProvider,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existsUserWithSameEmail = await this.userRepository.findByEmail(
      createUserDto.email,
    );

    if (existsUserWithSameEmail) {
      throw new BadRequestException('User already exists');
    }
    const passHash = await this.hashProvider.createHash(createUserDto.password);

    const user = await this.userRepository.create({
      ...createUserDto,
      password: passHash,
    });

    return classToClass(user);
  }

  async update(
    id: number,
    { password, oldPassword, ...restUpdateUserDto }: UpdateUserDto,
  ) {
    const updateUserDto: UpdateUserDto = { ...restUpdateUserDto };

    if (password) {
      if (!oldPassword) throw new BadRequestException(`Old password missing`);

      const userData = await this.userRepository.findById(id);

      if (!userData) throw new NotFoundException(`user #${id} not found`);

      const passwordMatch = await this.hashProvider.compare(
        oldPassword,
        userData.password,
      );

      if (!passwordMatch) {
        throw new BadRequestException('password incorrect');
      }

      const passHash = await this.hashProvider.createHash(password);
      updateUserDto.password = passHash;
    }

    const user = await this.userRepository.update(id, updateUserDto);

    return classToClass(user);
  }

  async remove(id: number) {
    return this.userRepository.removeById(id);
  }

  findAll() {
    return this.userRepository.findAll();
  }

  findByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }

  findById(id: number) {
    return this.userRepository.findById(id);
  }
}
