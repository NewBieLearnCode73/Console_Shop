import { Module } from '@nestjs/common';
import { MomoService } from './service/momo.service';

@Module({
  imports: [],
  controllers: [],
  providers: [MomoService],
  exports: [MomoService],
})
export class MomoModule {}
