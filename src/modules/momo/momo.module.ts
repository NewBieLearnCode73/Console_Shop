import { Module } from '@nestjs/common';
import { MomoService } from './service/momo.service';
import { KafkaModule } from '../kafka/kafka.module';
import { KafkaService } from '../kafka/service/kafka.service';

@Module({
  imports: [KafkaModule],
  controllers: [],
  providers: [MomoService, KafkaService],
  exports: [MomoService],
})
export class MomoModule {}
