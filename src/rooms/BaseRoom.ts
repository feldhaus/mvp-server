import { Room, Client } from '@colyseus/core';
import { RoomState } from './schema/RoomState';
import { PlayerState } from './schema/PlayerState';

export class BaseRoom extends Room<RoomState> {
  public maxClients = 4;

  public state = new RoomState();

  onCreate(_options: unknown) {
    this.onMessage(
      'action',
      (client, message: { to?: string; payload?: unknown }) => {
        const { to, payload } = message;

        if (
          payload &&
          typeof payload === 'object' &&
          'score' in payload &&
          typeof payload.score === 'number'
        ) {
          const player = this.state.players.get(client.sessionId);
          player.score = payload.score;
        }

        if (to) {
          // Send action to a specific player
          const recipient = this.clients.find(
            ({ sessionId }) => sessionId === to,
          );
          if (!recipient) return;

          recipient.send('action', {
            from: client.sessionId,
            payload,
            private: true,
          });
        } else {
          // Broadcast action to everyone (except sender)
          this.broadcast(
            'action',
            {
              from: client.sessionId,
              payload,
              private: false,
            },
            { except: client },
          );
        }
      },
    );
  }

  onJoin(client: Client, options: unknown) {
    console.log(client.sessionId, 'joined!', options);

    const { id, name, avatar, score } = options as {
      id: string;
      name: string;
      avatar: string;
      score: number;
    };

    const player = new PlayerState();
    player.id = id;
    player.name = name;
    player.avatar = avatar;
    player.score = score;
    this.state.players.set(client.sessionId, player);
  }

  onLeave(client: Client, _consented: boolean) {
    console.log(client.sessionId, 'left!');

    this.state.players.delete(client.sessionId);
  }

  onDispose() {
    console.log('Room', this.roomId, 'disposing...');
  }
}
