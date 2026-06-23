import { app } from './app.js';
import { env } from './data/env.js';
import { sequelize } from './data/database.js';

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection successful');
    await sequelize.sync();
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }

  app.listen(env.port, () => {
    console.log(`Server listening on port ${env.port}`);
  });
};

start();
