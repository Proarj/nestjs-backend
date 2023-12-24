import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApiModule } from './api/api.module';
import { ClickhouseService } from './api/clickhouse/clickhouse.service';
@Module({
  imports: [ApiModule, ConfigModule.forRoot()],
  providers: [ClickhouseService],
})
export class AppModule {}
