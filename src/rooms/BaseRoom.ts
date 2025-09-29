import { Room, Client } from '@colyseus/core';
import { RoomState } from './schema/RoomState';
import { PlayerState } from './schema/PlayerState';

export class BaseRoom extends Room<RoomState> {
  public maxClients = 4;

  public state = new RoomState();

  onCreate(options: any) {
    this.onMessage(
      'action',
      (client, message: { to?: string; payload?: any }) => {
        const { to, payload } = message;

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

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, 'joined!', options);

    const player = new PlayerState();
    player.fbId = options.fbId;
    player.name = options.name;
    player.avatar = options.avatar;
    this.state.players.set(client.sessionId, player);
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, 'left!');

    this.state.players.delete(client.sessionId);
  }

  onDispose() {
    console.log('Room', this.roomId, 'disposing...');
  }
}
