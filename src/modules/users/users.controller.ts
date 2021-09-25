import { classToClass } from 'class-transformer';
import { UserPayloadDto } from './../../shared/dto/user-payload.dto';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './services/users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public } from 'src/shared/decorators/public.decorator';
import { User } from 'src/shared/decorators/user.decorator';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Permission, Role } from 'src/shared/constants/authorization';
import { Permissions } from 'src/shared/decorators/permissions.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post('create')
  async create(@Body() createUserDto: CreateUserDto) {
    return classToClass(this.usersService.create(createUserDto));
  }

  @Get('me')
  async findMe(@User() userPayloadDto: UserPayloadDto) {
    const user = await this.usersService.findById(+userPayloadDto.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return classToClass(user);
  }

  @Get()
  @Roles(Role.Admin)
  @Permissions(Permission.USER_LIST_ALL)
  findAll() {
    return classToClass(this.usersService.findAll());
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return classToClass(this.usersService.findById(+id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return classToClass(this.usersService.update(+id, updateUserDto));
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return classToClass(this.usersService.remove(+id));
  }
}
