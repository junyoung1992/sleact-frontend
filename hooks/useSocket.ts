import { useCallback } from 'react';
import io from 'socket.io-client';

const backUrl = 'http://localhost:3095';
const sockets: { [key: string]: SocketIOClient.Socket } = {};

const useSocket = (workspace?: string): [SocketIOClient.Socket | undefined, () => void] => {
  const disconnect = useCallback(() => {
    if (workspace) {
      sockets[workspace].disconnect();
      delete sockets[workspace];
    }
  }, [workspace]);

  if (!workspace) {
    return [undefined, disconnect];
  }

  if (!sockets[workspace]) {
    sockets[workspace] = io.connect(`${backUrl}/ws-${workspace}`, {
      transports: ['websocket'], // 연결할 때도 웹소켓만 사용
    });
  }

  return [sockets[workspace], disconnect];
};

export default useSocket;
