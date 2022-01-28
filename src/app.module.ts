import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AsyncJobModule } from './async-job/async-job.module';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6381,
      },
    }),
    AsyncJobModule,
    EventEmitterModule.forRoot(),
  ],
  controllers: [AppController]
})
export class AppModule {}
