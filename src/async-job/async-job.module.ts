import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { QUEUE_NAME } from '../constants';
import { AsyncJobController } from './async-job.controller';
import { AsyncJobProcessor } from './async-job.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: QUEUE_NAME,
    }),
  ],
  controllers: [AsyncJobController],
  providers: [AsyncJobProcessor],
})
export class AsyncJobModule {}
