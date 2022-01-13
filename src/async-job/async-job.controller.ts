import { InjectQueue } from '@nestjs/bull';
import {
  Controller,
  Get,
  MessageEvent,
  Post,
  Query,
  Sse,
} from '@nestjs/common';
import Bull, { Job, Queue } from 'bull';
import { EventEmitter2 } from 'eventemitter2';
import {
  concat,
  distinctUntilChanged,
  fromEvent,
  map,
  merge,
  Observable,
  take,
  takeUntil,
  takeWhile,
  tap,
} from 'rxjs';
import { JOB_ACTIVE, JOB_COMPLETED, JOB_PROGRESS } from 'src/constants';

@Controller('async-job')
export class AsyncJobController {
  constructor(
    @InjectQueue('async-job') private readonly queue: Queue,
    private eventEmitter: EventEmitter2,
  ) {}

  @Get()
  async getJob(@Query('jobId') jobId: Bull.JobId) {
    return this.queue.getJob(jobId);
  }

  @Post('process')
  async queueJob() {
    return this.queue.add('queue-job', {});
  }

  @Sse('sse')
  sse(): Observable<MessageEvent> {
    const activeJobListener$ = fromEvent(this.eventEmitter, JOB_ACTIVE);
    const jobProgressListener$ = fromEvent(this.eventEmitter, JOB_PROGRESS);
    const jobCompletedListener$ = fromEvent(this.eventEmitter, JOB_COMPLETED);

    return merge(
      activeJobListener$.pipe(
        map((job: Job) => ({ data: `Job ${job.id} is active` })),
      ),
      jobProgressListener$.pipe(
        distinctUntilChanged(({ progress: a }, { progress: b }) => a === b),
        map(({ job, progress }: { job: Job; progress: number }) => ({
          data: `Job ${job.id} has progressed to ${progress}`,
        })),
      ),
      jobCompletedListener$.pipe(
        map(({ job, result }: { job: Job; result: string }) => ({
          data: `Job ${job.id} has finished processing and yielded the result '${result}'`,
          // data: { job, progress: job.progress(), result } // Note that we can also pass an object (It will be converted to a JSON String by NestJS)
        })),
      ),
    );
  }
}
