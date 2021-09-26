import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { HashProvider } from '../../../shared/providers/HashProvider/implementations/HashProvider';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UsersRepository } from '../repositories/implementations/UsersRepository';

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

    return user;
  }

  async update(
    id: number,
    { password, oldPassword, ...restUpdateUserDto }: UpdateUserDto,
  ) {
    const updateUserDto: UpdateUserDto = { ...restUpdateUserDto };

    const userData = await this.userRepository.findById(id);
    if (!userData) throw new NotFoundException(`user #${id} not found`);

    if (password) {
      if (!oldPassword) throw new BadRequestException(`Old password missing`);

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

    return user;
  }

  async remove(id: number) {
    const userData = await this.userRepository.findById(id);
    if (!userData) throw new NotFoundException(`user #${id} not found`);

    return this.userRepository.removeById(id);
  }

  async findByEmail(email: string) {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findById(id: number) {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  // missing testing
  findAll() {
    return this.userRepository.findAll();
  }
}
