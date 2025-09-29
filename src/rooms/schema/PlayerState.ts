import { Schema, type } from '@colyseus/schema';

export class PlayerState extends Schema {
  @type('string') fbId: string;
  @type('string') name: string;
  @type('string') avatar: string;
}
