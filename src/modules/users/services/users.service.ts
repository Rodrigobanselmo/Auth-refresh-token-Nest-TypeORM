import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { HashProvider } from 'src/shared/providers/HashProvider/implementations/HashProvider';
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

    console.log(`existsUserWithSameEmail`, existsUserWithSameEmail);
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
    if (!id) throw new BadRequestException(`Bad Request`);

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
    if (!id) throw new BadRequestException(`Bad Request`);
    const userData = await this.userRepository.findById(id);
    if (!userData) throw new NotFoundException(`user #${id} not found`);

    return this.userRepository.removeById(id);
  }

  findAll() {
    return this.userRepository.findAll();
  }

  findByEmail(email: string) {
    if (!email) throw new BadRequestException(`Bad Request`);
    return this.userRepository.findByEmail(email);
  }

  findById(id: number) {
    if (!id) throw new BadRequestException(`Bad Request`);
    return this.userRepository.findById(id);
  }
}
