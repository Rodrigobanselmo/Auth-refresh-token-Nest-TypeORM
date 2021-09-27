import { classToClass } from 'class-transformer';
import { UserPayloadDto } from '../../../shared/dto/user-payload.dto';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { Public } from '../../../shared/decorators/public.decorator';
import { User } from '../../../shared/decorators/user.decorator';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { Permission, Role } from '../../../shared/constants/authorization';
import { Permissions } from '../../../shared/decorators/permissions.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post('create')
  async create(@Body() createUserDto: CreateUserDto) {
    return classToClass(this.usersService.create(createUserDto));
  }

  @Get('me')
  findMe(@User() userPayloadDto: UserPayloadDto) {
    return classToClass(this.usersService.findById(+userPayloadDto.userId));
  }

  @Get()
  @Roles(Role.Admin)
  @Permissions(Permission.USER_LIST_ALL)
  findAll() {
    return classToClass(this.usersService.findAll());
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return classToClass(this.usersService.findById(+id));
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    return classToClass(this.usersService.update(+id, updateUserDto));
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return classToClass(this.usersService.remove(+id));
  }
}
