import { User } from '.prisma/client';
import { CreateUserDto } from '../../dto/create-user.dto';
import { UpdateUserDto } from '../../dto/update-user.dto';
import { UserEntity } from '../../entities/user.entity';
import { IUsersRepository } from '../IUsersRepository';

class UsersRepositoryInMemory implements IUsersRepository {
  users: User[] = [];

  create(createUserDto: CreateUserDto): any {
    const user = new UserEntity(createUserDto);

    user.id = Math.random();

    this.users.push(user);
    return user;
  }

  update(id: number, updateUserDto: UpdateUserDto): any {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (!(userIndex >= 0)) return;
    const user = this.users[userIndex];
    const updatedUser = { ...user, ...updateUserDto };
    this.users[userIndex] = updatedUser;
    return updatedUser;
  }
  removeById(id: number): any {
    const user = this.users.find((user) => user.id == id);
    this.users.splice(this.users.indexOf(user));
    return user;
  }
  findAll(): any {
    return this.users;
  }
  findByEmail(email: string): any {
    const user = this.users.find((i) => i.email === email);
    return user;
  }
  findById(id: number): any {
    const user = this.users.find((i) => i.id === id);
    return user;
  }
}

export { UsersRepositoryInMemory };
