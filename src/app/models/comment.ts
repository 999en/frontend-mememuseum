import { User } from './user';
import { Meme } from './meme';

export interface Comment {
  _id?: string;
  meme: string | Meme;
  author: string | User;
  text: string;
  createdAt?: string;
  updatedAt?: string;
}
