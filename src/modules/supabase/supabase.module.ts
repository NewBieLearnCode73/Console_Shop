import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from './service/supabase.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: SupabaseClient,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return createClient(
          configService.getOrThrow('SUPABASE_URL'),
          configService.getOrThrow('SUPABASE_KEY'),
        );
      },
    },
    SupabaseService,
  ],
  exports: [SupabaseService],
  controllers: [],
})
export class SupabaseModule {}
