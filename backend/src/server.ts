import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log('====================================================');
  console.log(`  BrajSahayak Backend Server Running Locally`);
  console.log(`  Port: ${PORT}`);
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  AI Provider: ${process.env.AI_PROVIDER || 'mock'}`);
  console.log(`  Health: http://localhost:${PORT}/api/health`);
  console.log('====================================================');
});
