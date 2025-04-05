import fs from 'fs/promises';
import path from 'path';

export class Logger {
  private logDir: string;
  private logFile: string;
  private startTime: number = 0;
  private totalItems: number = 0;
  private completedItems: number = 0;

  constructor() {
    this.logDir = path.join(process.cwd(), 'logs');
    this.logFile = path.join(this.logDir, `optimization-${new Date().toISOString().replace(/:/g, '-')}.log`);
  }

  async initialize(totalItems: number) {
    await fs.mkdir(this.logDir, { recursive: true });
    this.totalItems = totalItems;
    this.completedItems = 0;
    this.startTime = Date.now();
    await this.log('Content optimization job started');
  }

  async log(message: string, level: 'info' | 'error' | 'success' = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] ${level.toUpperCase()}: `;
    
    switch (level) {
      case 'error':
        console.error(prefix + message);
        break;
      case 'success':
        console.log(prefix + message);
        break;
      default:
        console.log(prefix + message);
    }
  }

  async logProgress(item: string) {
    this.completedItems++;
    const progress = (this.completedItems / this.totalItems) * 100;
    const elapsed = (Date.now() - this.startTime) / 1000;
    await this.log(`Progress: ${progress.toFixed(1)}% (${this.completedItems}/${this.totalItems}) - ${item}`);
  }

  async logError(error: Error, context: string) {
    await this.log(`${context} - ${error.message}`, 'error');
    if (error.stack) {
      console.error(error.stack);
    }
  }

  async logCompletion() {
    const totalTime = (Date.now() - this.startTime) / 1000;
    await this.log(`Completed all tasks in ${totalTime.toFixed(2)} seconds`, 'success');
  }
} 