import { Schema, type } from '@colyseus/schema';

export class PlayerState extends Schema {
  @type('string') id: string;
  @type('string') name: string;
  @type('string') avatar: string;
  @type('uint64') score: number = 0;
  @type('boolean') ready: boolean = false;
}
