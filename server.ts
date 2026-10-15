import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import healthHandler from './api/health.ts';
import holidayHandler from './api/holiday.ts';
import {
  getScheduleHandler,
  updateScheduleHandler,
  getHistoryHandler,
  sendWeeklyReportHandler,
} from './api/reports.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Serverless API Endpoints
  app.get('/api/health', healthHandler);
  app.get('/api/holiday', holidayHandler);
  app.get('/api/holidays', holidayHandler);

  // HQ Weekly Attendance & Hours Reporting API Endpoints
  app.get('/api/reports/schedule', getScheduleHandler);
  app.post('/api/reports/schedule', updateScheduleHandler);
  app.get('/api/reports/history', getHistoryHandler);
  app.post('/api/reports/send-weekly', sendWeeklyReportHandler);

  // In development, mount Vite's middleware
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ShiftPulse full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
