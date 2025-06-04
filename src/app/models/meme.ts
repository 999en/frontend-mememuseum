import { User } from './user';

export interface MemeVote {
  user: string | User;
  voteType: 'up' | 'down';
}

export interface Meme {
  _id?: string;
  title: string;
  imageUrl: string;
  tags?: string[];
  uploader: string | User;
  upvotes?: number;
  downvotes?: number;
  votedBy?: MemeVote[];
  createdAt?: string;
  updatedAt?: string;
}
