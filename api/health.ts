import type { Request, Response } from 'express';

export interface HealthResponse {
  status: 'ok' | 'degraded';
  timestamp: string;
  uptime: number;
  environment: string;
  service: string;
}

export async function healthHandler(req?: Request | any, res?: Response | any) {
  const data: HealthResponse = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: typeof process.uptime === 'function' ? process.uptime() : 0,
    environment: process.env.NODE_ENV || 'development',
    service: 'ShiftPulse Serverless API',
  };

  if (res && typeof res.status === 'function') {
    return res.status(200).json(data);
  }
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export default healthHandler;
