require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./shared/config/database.config');

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL connected successfully.');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
}

bootstrap();
