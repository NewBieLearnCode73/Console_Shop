import { Controller } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class AuthConsumer {
  constructor(private readonly authService: AuthService) {}

  @EventPattern('auth_send_mail_register')
  async handleUserCreated(@Payload() payload: { email: string }) {
    console.log('Received auth_send_mail_register event:', payload);
    await this.authService.sendActiveAccountEmail(payload.email, payload.email);
  }
}
