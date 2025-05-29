import { Controller, Get, Inject, LoggerService } from '@nestjs/common';
import { AppService } from './app.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  @Get()
  getHello(): string {
    this.logger.log('Hello endpoint accessed', 'AppController');
    return this.appService.getHello();
  }

  @Get('health')
  healthCheck() {
    const healthData = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      database: {
        status: 'connected', // You might want to check actual DB connection
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'vallmere_db'
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024)
      },
      system: {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        pid: process.pid
      }
    };

    this.logger.log(`Health check accessed - System healthy`, 'AppController', {
      uptime: healthData.uptime,
      memory: healthData.memory
    });

    return healthData;
  }

  @Get('admin/test')
  adminTest() {
    this.logger.log('Admin test endpoint accessed', 'AppController');
    return {
      message: 'Admin test endpoint working correctly',
      timestamp: new Date().toISOString(),
      service: 'vallmere-backend',
      version: '1.0.0'
    };
  }
}
