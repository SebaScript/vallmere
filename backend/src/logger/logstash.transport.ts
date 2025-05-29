import { Injectable } from '@nestjs/common';
import * as winston from 'winston';
import Transport = require('winston-transport');
import * as net from 'net';
import * as os from 'os';

export interface LogstashTransportOptions {
  host: string;
  port: number;
  appName: string;
  level?: string;
  silent?: boolean;
  timeout?: number;
  retryTimeout?: number;
  maxRetries?: number;
}

@Injectable()
export class LogstashTransport extends Transport {
  private socket: net.Socket | null = null;
  private buffer: any[] = [];
  private connected = false;
  private connecting = false;
  private retryCount = 0;

  constructor(private readonly options: LogstashTransportOptions) {
    super({ level: options.level || 'info' });
    this.connect();
  }

  private connect(): void {
    if (this.connecting || this.connected) {
      return;
    }

    this.connecting = true;
    this.socket = new net.Socket();

    // Connection timeout
    this.socket.setTimeout(this.options.timeout || 5000);

    this.socket.on('connect', () => {
      this.connected = true;
      this.connecting = false;
      this.retryCount = 0;
      console.log(`✅ Connected to Logstash at ${this.options.host}:${this.options.port}`);
      
      // Send buffered logs
      this.flushBuffer();
    });

    this.socket.on('error', (error) => {
      this.connected = false;
      this.connecting = false;
      
      if (!this.options.silent && this.retryCount === 0) {
        console.error(`❌ Logstash connection error:`, error.message);
      }
      
      this.handleReconnect();
    });

    this.socket.on('close', () => {
      this.connected = false;
      this.connecting = false;
      console.log('🔌 Connection to Logstash closed');
      this.handleReconnect();
    });

    this.socket.on('timeout', () => {
      console.log('⏰ Logstash connection timeout');
      this.socket?.destroy();
    });

    try {
      this.socket.connect(this.options.port, this.options.host);
    } catch (error) {
      this.connecting = false;
      console.error('❌ Failed to connect to Logstash:', error);
      this.handleReconnect();
    }
  }

  private handleReconnect(): void {
    if (this.retryCount < (this.options.maxRetries || 5)) {
      this.retryCount++;
      const delay = Math.min(1000 * Math.pow(2, this.retryCount - 1), 30000);
      
      setTimeout(() => {
        if (!this.connected && !this.connecting) {
          console.log(`🔄 Reconnecting to Logstash (attempt ${this.retryCount})...`);
          this.connect();
        }
      }, delay);
    }
  }

  private flushBuffer(): void {
    while (this.buffer.length > 0 && this.connected) {
      const log = this.buffer.shift();
      this.sendLog(log);
    }
  }

  private sendLog(logEntry: any): void {
    if (!this.connected || !this.socket) {
      this.buffer.push(logEntry);
      return;
    }

    try {
      const logString = JSON.stringify(logEntry) + '\n';
      this.socket.write(logString);
    } catch (error) {
      console.error('❌ Error sending log to Logstash:', error);
      this.buffer.push(logEntry);
    }
  }

  log(info: any, callback: () => void): void {
    setImmediate(() => {
      this.emit('logged', info);
    });

    const logEntry = {
      '@timestamp': new Date().toISOString(),
      level: info.level,
      message: info.message,
      service: this.options.appName,
      type: 'backend',
      environment: process.env.NODE_ENV || 'development',
      hostname: os.hostname(),
      pid: process.pid,
      context: info.context || 'Application',
      trace: info.trace || null,
      metadata: {
        version: process.env.npm_package_version || '1.0.0',
        node_version: process.version,
        platform: os.platform(),
        architecture: os.arch()
      },
      ...info
    };

    this.sendLog(logEntry);
    callback();
  }

  close(): void {
    if (this.socket) {
      this.socket.destroy();
      this.socket = null;
    }
    this.connected = false;
    this.connecting = false;
  }
} 