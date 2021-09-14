import { UpdateUserDto } from './../dto/update-user.dto';
import { CreateUserDto } from './../dto/create-user.dto';
import { User } from '../entities/user.entity';

interface IUsersRepository {
  create(createUserDto: CreateUserDto): Promise<User>;
  update(id: number, updateUserDto: UpdateUserDto): Promise<User>;
  removeById(id: number): Promise<User>;
  findAll(): Promise<User[]>;
  findByEmail(email: string): Promise<User>;
  findById(id: number): Promise<User>;
}
export { IUsersRepository };
