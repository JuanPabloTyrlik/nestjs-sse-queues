import {
  OnQueueActive,
  OnQueueCompleted,
  OnQueueError,
  OnQueueProgress,
  Process,
  Processor,
} from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  JOB_ACTIVE,
  JOB_COMPLETED,
  JOB_ERROR,
  JOB_PROGRESS,
} from 'src/constants';

@Processor('async-job')
export class AsyncJobProcessor {
  private readonly logger = new Logger(AsyncJobProcessor.name);

  constructor(private eventEmitter: EventEmitter2) {}

  @Process('queue-job')
  async handleJobProcess(job: Job): Promise<string> {
    this.logger.debug('Processing request...');
    this.logger.debug(job.data);
    let progress = 0;

    const delay = (ms) => {
      return new Promise((resolve) => setTimeout(resolve, ms));
    };

    const loop = async () => {
      while (progress < 100) {
        progress = progress + 5;
        job.progress(progress);

        await delay(500);
      }
    };

    await loop();
    this.logger.debug('Proccess completed');
    return 'Job Completed';
  }

  @OnQueueActive()
  handleActiveJob(job: Job) {
    // Job has started
    this.logger.log(`Job ${job.id} has started`);
    this.eventEmitter.emit(JOB_ACTIVE, job);
  }

  @OnQueueProgress()
  handleJobProgress(job: Job, progress: number) {
    // Job progress has been updated to `progress`
    this.logger.log(`Job ${job.id} has progressed to ${progress}`);
    this.eventEmitter.emit(JOB_PROGRESS, { job, progress });
  }

  @OnQueueCompleted()
  handleJobCompleted(job: Job, result: any) {
    // Job has finished processing
    this.logger.log(
      `Job ${job.id} has finished processing and yielded the result '${result}'`,
    );
    this.eventEmitter.emit(JOB_COMPLETED, { job, result });
  }

  @OnQueueError()
  handleError(error: Error) {
    this.logger.log("There's been an error");
    this.eventEmitter.emit(JOB_ERROR, { error });
  }
}
