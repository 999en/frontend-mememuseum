import { User } from './user';
import { Meme } from './meme';

export interface Vote {
  _id?: string;
  meme: string | Meme;
  user: string | User;
  value: 1 | -1;
  createdAt?: string;
  updatedAt?: string;
}
