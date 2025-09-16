import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { sendMailProvidePassword } from 'src/utils/brevo_helper';

@Controller()
export class UserConsumer {
  constructor() {}

  @EventPattern('send_mail_provide_new_password')
  async handleProvideNewPassword(
    @Payload() payload: { email: string; name: string; newPassword: string },
  ) {
    console.log('Received send_mail_provide_new_password event:', payload);
    await sendMailProvidePassword(
      payload.email,
      payload.name,
      payload.newPassword,
    );
  }
}
