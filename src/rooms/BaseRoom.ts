import { Room, Client } from '@colyseus/core';
import { RoomState } from './schema/RoomState';
import { PlayerState } from './schema/PlayerState';
import { isScorePayload } from '../utils/ScorePayload';
import { isReadyPayload } from '../utils/ReadyPayload';
import { Message } from '../types';

export class BaseRoom extends Room<RoomState> {
  public maxClients = 4;

  public state = new RoomState();

  onCreate(_options: unknown) {
    this.onMessage('action', (client, message: Message) => {
      this.updateState(client, message);
      this.handleMessage(client, message);
    });
  }

  onJoin(client: Client, options: unknown) {
    console.log(client.sessionId, 'joined!', options);

    const { id, name, avatar } = options as {
      id: string;
      name: string;
      avatar: string;
    };

    const player = new PlayerState();
    player.id = id;
    player.name = name;
    player.avatar = avatar;

    this.state.players.set(client.sessionId, player);
  }

  onLeave(client: Client, _consented: boolean) {
    console.log(client.sessionId, 'left!');
    this.state.players.delete(client.sessionId);
  }

  onDispose() {
    console.log('Room', this.roomId, 'disposing...');
  }

  updateState(client: Client, message: Message) {
    const { payload } = message;

    if (isScorePayload(payload)) {
      const player = this.state.players.get(client.sessionId);
      player.score = payload.score;
    }

    if (isReadyPayload(payload)) {
      const player = this.state.players.get(client.sessionId);
      player.ready = payload.ready;
    }
  }

  handleMessage(client: Client, message: Message) {
    const { to, payload, sentAt } = message;

    if (to) {
      // Send action to a specific player
      const recipient = this.clients.find(({ sessionId }) => sessionId === to);
      if (!recipient) return;

      recipient.send('action', {
        from: client.sessionId,
        payload,
        sentAt,
        private: true,
      });
    } else {
      // Broadcast action to everyone (except sender)
      this.broadcast(
        'action',
        {
          from: client.sessionId,
          payload,
          sentAt,
          private: false,
        },
        { except: client },
      );
    }
  }
}
