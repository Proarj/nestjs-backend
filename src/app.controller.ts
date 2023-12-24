import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getRoot(): string {
    return 'Hello from the root endpoint!';
  }
}
