import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { readFileSync } from 'fs';
import { resolve } from 'path';

@Controller()
export class AppController {
  @Get()
  index(@Res() response: Response) {
    response
      .type('text/html')
      .send(
        readFileSync(resolve(__dirname, '../public/index.html')).toString(),
      );
  }
}
