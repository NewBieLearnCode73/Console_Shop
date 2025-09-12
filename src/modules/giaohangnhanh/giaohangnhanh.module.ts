import { Module } from '@nestjs/common';
import { GhnService } from './service/ghn.service';
import { ConfigModule } from '@nestjs/config';
import { GhnController } from './controller/ghn.controller';

@Module({
  imports: [ConfigModule],
  controllers: [GhnController],
  providers: [GhnService],
  exports: [GhnService],
})
export class GiaohangnhanhModule {}
