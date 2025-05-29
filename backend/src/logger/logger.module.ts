import { Module, Global } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import { LogstashTransport } from './logstash.transport';

@Global()
@Module({
  imports: [
    WinstonModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const logstashHost = configService.get<string>('LOGSTASH_HOST', 'localhost');
        const logstashPort = configService.get<number>('LOGSTASH_PORT', 5000);
        const nodeEnv = configService.get<string>('NODE_ENV', 'development');
        const isDevelopment = nodeEnv !== 'production';
        
        const transports: winston.transport[] = [];

        // Console transport with colored output for development
        transports.push(
          new winston.transports.Console({
            level: isDevelopment ? 'debug' : 'info',
            format: winston.format.combine(
              winston.format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss'
              }),
              winston.format.errors({ stack: true }),
              winston.format.colorize({ all: true }),
              winston.format.printf(({ timestamp, level, message, context, trace, stack, ...meta }) => {
                const contextStr = context ? `[${context}]` : '';
                const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
                const errorStack = stack || trace ? `\n${stack || trace}` : '';
                
                return `${timestamp} ${level} ${contextStr} ${message}${metaStr}${errorStack}`;
              }),
            ),
          })
        );

        // File transport for persistent logging
        if (!isDevelopment) {
          transports.push(
            new winston.transports.File({
              filename: 'logs/error.log',
              level: 'error',
              format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.errors({ stack: true }),
                winston.format.json()
              ),
              maxsize: 5242880, // 5MB
              maxFiles: 5,
            }),
            new winston.transports.File({
              filename: 'logs/combined.log',
              format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.errors({ stack: true }),
                winston.format.json()
              ),
              maxsize: 5242880, // 5MB
              maxFiles: 5,
            })
          );
        }
        
        // Add Logstash transport if properly configured
        if (logstashHost && logstashPort) {
          try {
            transports.push(
              new LogstashTransport({
                host: logstashHost,
                port: Number(logstashPort),
                appName: 'vallmere-backend',
                level: isDevelopment ? 'debug' : 'info',
                silent: false,
                timeout: 5000,
                maxRetries: 5,
              })
            );
          } catch (error) {
            console.error('❌ Failed to initialize Logstash transport:', error);
          }
        } else {
          console.warn('⚠️ Logstash configuration missing, logs will only go to console/file');
        }

        return {
          level: isDevelopment ? 'debug' : 'info',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'context'] })
          ),
          defaultMeta: { 
            service: 'vallmere-backend',
            environment: nodeEnv,
            version: process.env.npm_package_version || '1.0.0'
          },
          transports,
          exitOnError: false,
          // Handle uncaught exceptions and rejections
          exceptionHandlers: [
            new winston.transports.Console({
              format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.errors({ stack: true }),
                winston.format.json()
              )
            })
          ],
          rejectionHandlers: [
            new winston.transports.Console({
              format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.errors({ stack: true }),
                winston.format.json()
              )
            })
          ]
        };
      },
    }),
  ],
  exports: [WinstonModule],
})
export class LoggerModule {} 