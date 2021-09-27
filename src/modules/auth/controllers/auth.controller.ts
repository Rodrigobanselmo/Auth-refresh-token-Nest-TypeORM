import { Body, Controller, Delete, Post } from '@nestjs/common';

import { Public } from '../../../shared/decorators/public.decorator';
import { LoginUserDto } from '../dto/login-user.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { AuthService } from '../services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('session')
  session(@Body() loginUserDto: LoginUserDto) {
    return this.authService.session(loginUserDto);
  }

  @Public()
  @Post('refresh')
  refresh(@Body() { refresh_token }: RefreshTokenDto) {
    return this.authService.refresh(refresh_token);
  }

  @Delete('refresh')
  deleteAll() {
    return this.authService.deleteAllExpiredRefreshTokens();
  }
}
