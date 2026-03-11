import http from 'node:http';
import { Server as SocketIOServer } from 'socket.io';
import { env } from './config/env.js';
import { createApp } from './app.js';
import { logger } from './config/logger.js';
import { prisma } from './config/prisma.js';
import { pushActiveRunsUpdate, registerSSE } from './realtime/realtime.js';

const app = createApp();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: env.CORS_ORIGIN, credentials: true }
});

app.get('/api/active-runs', registerSSE);

setInterval(() => {
  pushActiveRunsUpdate(io).catch((error) => logger.error(error));
}, 15000);

async function resetStaleSyncErrorsOnStartup() {
  const result = await prisma.repository.updateMany({
    where: { syncStatus: 'ERROR' },
    data: { syncStatus: 'IDLE', syncError: null }
  });

  if (result.count > 0) {
    logger.info(`Reset sync error state for ${result.count} repositories on startup`);
  }
}

resetStaleSyncErrorsOnStartup().catch((error) => logger.error(error));

server.listen(env.PORT, () => {
  logger.info(`DWMAS API running on http://localhost:${env.PORT}`);
});
