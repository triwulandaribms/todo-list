import { IScheduler } from "../core/IScheduler";

export class SimpleScheduler implements IScheduler {
  private intervals = new Map<string, NodeJS.Timeout>();


  scheduleRecurring(name: string, intervalMs: number, fn: () => void | Promise<void>) {
    const interval = setInterval(() => {
      Promise.resolve(fn()).catch(err => {
        console.error(`Scheduler error in job ${name}:`, err);
      });
    }, intervalMs);
  
    this.intervals.set(name, interval);
  }
  stop(name: string): void {
    const interval = this.intervals.get(name);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(name);
    }
  }
}


