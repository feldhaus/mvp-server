"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRoom = void 0;
const core_1 = require("@colyseus/core");
const RoomState_1 = require("./schema/RoomState");
const PlayerState_1 = require("./schema/PlayerState");
class BaseRoom extends core_1.Room {
    constructor() {
        super(...arguments);
        this.maxClients = 4;
        this.state = new RoomState_1.RoomState();
    }
    onCreate(options) {
        this.onMessage('action', (client, message) => {
            const { to, payload } = message;
            if (to) {
                // Send action to a specific player
                const recipient = this.clients.find(({ sessionId }) => sessionId === to);
                if (!recipient)
                    return;
                recipient.send('action', {
                    from: client.sessionId,
                    payload,
                    private: true,
                });
            }
            else {
                // Broadcast action to everyone (except sender)
                this.broadcast('action', {
                    from: client.sessionId,
                    payload,
                    private: false,
                }, { except: client });
            }
        });
    }
    onJoin(client, options) {
        console.log(client.sessionId, 'joined!', options);
        const player = new PlayerState_1.PlayerState();
        player.fbId = options.fbId;
        player.name = options.name;
        player.avatar = options.avatar;
        this.state.players.set(client.sessionId, player);
    }
    onLeave(client, consented) {
        console.log(client.sessionId, 'left!');
        this.state.players.delete(client.sessionId);
    }
    onDispose() {
        console.log('Room', this.roomId, 'disposing...');
    }
}
exports.BaseRoom = BaseRoom;
