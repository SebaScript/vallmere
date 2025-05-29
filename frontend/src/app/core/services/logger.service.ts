import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export enum LogLevel {
  TRACE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
}

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private logstashHost: string;
  private logstashPort: string;
  private appName = 'vallmere-frontend';
  private logLevel: LogLevel = LogLevel.INFO; // Default level
  private clientIp: string = '';
  private userAgent: string = navigator.userAgent;
  private queuedLogs: Array<any> = [];
  private isProcessingQueue = false;

  constructor(private http: HttpClient) {
    // Get configuration from environment
    this.logstashHost = environment.logstashHost || 'localhost';
    this.logstashPort = environment.logstashPort || '5000';
    
    // Get client IP (in a real app you'd use a service)
    this.http.get('https://api.ipify.org?format=json').subscribe(
      (response: any) => this.clientIp = response.ip,
      () => console.error('Could not determine client IP')
    );
  }

  private sendLog(level: string, message: string, data?: any): void {
    const logEntry = {
      type: 'frontend',
      appName: this.appName,
      timestamp: new Date().toISOString(),
      level,
      message,
      url: window.location.href,
      userAgent: this.userAgent,
      clientIp: this.clientIp,
      data
    };

    // Always log to console for debugging
    console.log(`[${level.toUpperCase()}] ${message}`, data);
    
    // Queue log for sending to Logstash
    this.queuedLogs.push(logEntry);
    this.processLogQueue();
  }
  
  private processLogQueue(): void {
    if (this.isProcessingQueue || this.queuedLogs.length === 0) {
      return;
    }
    
    this.isProcessingQueue = true;
    
    // Take up to 10 logs at a time
    const batch = this.queuedLogs.splice(0, Math.min(10, this.queuedLogs.length));
    
    // Use navigator.sendBeacon if available (works better for page unload)
    if (navigator.sendBeacon && !environment.production) {
      try {
        const blob = new Blob([JSON.stringify(batch)], { type: 'application/json' });
        navigator.sendBeacon(`http://${this.logstashHost}:${this.logstashPort}`, blob);
        this.isProcessingQueue = false;
        
        // Process remaining logs
        if (this.queuedLogs.length > 0) {
          setTimeout(() => this.processLogQueue(), 100);
        }
        return;
      } catch (e) {
        // Fall back to HTTP if beacon fails
      }
    }
    
    // HTTP fallback - Note this won't work for cross-origin requests without CORS
    // In production, you'd need a proper logging endpoint on your API server
    if (environment.production) {
      // In production, we just log locally and don't try to send to Logstash directly
      this.isProcessingQueue = false;
      
      // Process remaining logs
      if (this.queuedLogs.length > 0) {
        setTimeout(() => this.processLogQueue(), 100);
      }
      return;
    }
    
    // Development direct HTTP POST attempt
    this.http.post(`http://${this.logstashHost}:${this.logstashPort}`, batch)
      .subscribe({
        next: () => {
          this.isProcessingQueue = false;
          // Process remaining logs
          if (this.queuedLogs.length > 0) {
            setTimeout(() => this.processLogQueue(), 100);
          }
        },
        error: (error) => {
          console.error('Failed to send logs to Logstash:', error);
          this.isProcessingQueue = false;
          // Retry the queue after a delay
          if (this.queuedLogs.length > 0) {
            setTimeout(() => this.processLogQueue(), 5000);
          }
        }
      });
  }

  trace(message: string, data?: any): void {
    if (this.logLevel <= LogLevel.TRACE) {
      this.sendLog('trace', message, data);
    }
  }

  debug(message: string, data?: any): void {
    if (this.logLevel <= LogLevel.DEBUG) {
      this.sendLog('debug', message, data);
    }
  }

  info(message: string, data?: any): void {
    if (this.logLevel <= LogLevel.INFO) {
      this.sendLog('info', message, data);
    }
  }

  warn(message: string, data?: any): void {
    if (this.logLevel <= LogLevel.WARN) {
      this.sendLog('warn', message, data);
    }
  }

  error(message: string, data?: any): void {
    if (this.logLevel <= LogLevel.ERROR) {
      this.sendLog('error', message, data);
    }
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }
} 