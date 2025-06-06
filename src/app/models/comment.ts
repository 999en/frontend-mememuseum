import { User } from './user';
import { Meme } from './meme';

export interface Comment {
  _id: string;
  meme: string;
  author: {
    _id: string;
    username: string;
  };
  text: string;
  createdAt: Date | string;
  updatedAt?: Date | string;
}
