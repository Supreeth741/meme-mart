import app from './app';
import { env } from './config/env';
import { connectDatabase } from './config/database';
import { seedDatabase } from './utils/seed';
import { logger } from './utils/logger';

const start = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDatabase();

    // Seed default data (admin user + categories)
    await seedDatabase();

    // Start server
    app.listen(env.port, () => {
      logger.info(`Server running on port ${env.port} in ${env.nodeEnv} mode`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
