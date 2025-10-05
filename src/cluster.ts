import cluster from 'node:cluster';
import os from 'node:os';
import { Logger } from '@nestjs/common';

export class ClusterManager {
  private static readonly logger = new Logger('ClusterManager');

  static async Start(
    callback: () => Promise<void>,
    workers?: number
  ): Promise<void> {
    const num_workers = workers || os.cpus().length;
    if (cluster.isPrimary) {
      this.logger.log(`🚀 Master process ${process.pid} is running`);
      this.logger.log(`🔧 Starting ${num_workers} worker processes...`);
      this.logger.log(`💻 CPU Cores: ${os.cpus().length}`);
      for (let i = 0; i < num_workers; i++) {
        const worker = cluster.fork();
        this.logger.log(`✅ Worker ${worker.process.pid} started`);
      }
      cluster.on('exit', (worker, code, signal) => {
        this.logger.warn(
          `⚠️  Worker ${worker.process.pid} died (${signal || code}). Restarting...`
        );
        const new_worker = cluster.fork();
        this.logger.log(`✅ Worker ${new_worker.process.pid} restarted`);
      });
      process.on('SIGTERM', () => {
        this.logger.log('🛑 SIGTERM received. Shutting down gracefully...');
        for (const id in cluster.workers) {
          cluster.workers[id]?.kill();
        }
        process.exit(0);
      });
      process.on('SIGINT', () => {
        this.logger.log('🛑 SIGINT received. Shutting down gracefully...');
        for (const id in cluster.workers) {
          cluster.workers[id]?.kill();
        }
        process.exit(0);
      });
    } else {
      await callback();
      this.logger.log(`👷 Worker ${process.pid} is ready`);
    }
  }
}
