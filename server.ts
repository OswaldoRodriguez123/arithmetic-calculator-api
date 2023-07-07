import { AddressInfo } from 'net';
import http from 'http';
import { createApp } from './app';
import config from '@/config';

export const API_URL = '/api/v1';

const app = createApp();
const server = http.createServer(app);
const port = config.app.port;

server.listen(port, () => {
  const address = server.address() as AddressInfo;
  console.log('Express server started on port %s', address?.port);
});