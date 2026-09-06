import { io, Socket } from 'socket.io-client';
import { environment } from '../environments/environment';
import { RealtimeNotification } from './notification.types';

const socketUrl = environment.API_URL.replace(/\/api\/v1\/?$/, '');

export const connectNotificationSocket = (
  token: string,
  onNotification: (notification: RealtimeNotification) => void,
): Socket => {
  const socket = io(`${socketUrl}/notifications`, {
    auth: { token },
    transports: ['websocket'],
  });

  socket.on('notification', onNotification);
  return socket;
};
