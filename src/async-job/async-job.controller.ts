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
import { distinctUntilChanged, fromEvent, map, merge, Observable } from 'rxjs';
import {
  JOB_ACTIVE,
  JOB_COMPLETED,
  JOB_PROGRESS,
  QUEUE_NAME,
} from 'src/constants';

@Controller('async-job')
export class AsyncJobController {
  constructor(
    @InjectQueue(QUEUE_NAME) private readonly queue: Queue,
    private eventEmitter: EventEmitter2,
  ) {}

  @Get()
  async getJob(@Query('jobId') jobId: Bull.JobId): Promise<Bull.Job<any>> {
    return this.queue.getJob(jobId);
  }

  @Post('process')
  async queueJob(): Promise<Bull.Job<any>> {
    return this.queue.add({ some: 'info' });
  }

  @Sse('sse')
  sse(): Observable<MessageEvent> {
    const activeJobListener$ = fromEvent(this.eventEmitter, JOB_ACTIVE);
    const jobProgressListener$ = fromEvent(this.eventEmitter, JOB_PROGRESS);
    const jobCompletedListener$ = fromEvent(this.eventEmitter, JOB_COMPLETED);

    return merge(
      activeJobListener$.pipe(
        map((job: Job) => ({
          type: JOB_ACTIVE,
          data: `Job ${job.id} is active`,
        })),
      ),
      jobProgressListener$.pipe(
        distinctUntilChanged(({ progress: a }, { progress: b }) => a === b),
        map(({ job, progress }: { job: Job; progress: number }) => ({
          type: JOB_PROGRESS,
          data: `Job ${job.id} has progressed to ${progress}`,
        })),
      ),
      jobCompletedListener$.pipe(
        map(({ job, result }: { job: Job; result: string }) => ({
          type: JOB_COMPLETED,
          data: `Job ${job.id} has finished processing and yielded the result '${result}'`,
          // data: { job, progress: job.progress(), result } // Note that we can also pass an object (It will be converted to a JSON String by NestJS)
        })),
      ),
    );
  }
}
