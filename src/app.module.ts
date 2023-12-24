import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApiModule } from './api/api.module';
import { ClickhouseService } from './api/clickhouse/clickhouse.service';
import { AppController } from './app.controller';
@Module({
  imports: [ApiModule, ConfigModule.forRoot()],
  providers: [ClickhouseService],
  controllers: [AppController],
})
export class AppModule {}
