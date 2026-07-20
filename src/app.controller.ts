import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('admin/reset-to-migrations')
  resetToMigrations() {
    return this.appService.resetToLatestMigrations();
  }
}
