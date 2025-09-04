import { Module } from '@nestjs/common';
import { MomoService } from './service/momo.service';
import { KafkaModule } from '../kafka/kafka.module';
import { DatabaseModule } from '../database/database.module';
import { KafkaService } from '../kafka/service/kafka.service';

@Module({
  imports: [KafkaModule, DatabaseModule],
  controllers: [],
  providers: [MomoService, KafkaService],
  exports: [MomoService],
})
export class MomoModule {}
