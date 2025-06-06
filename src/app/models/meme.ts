import { User } from './user';
import { Comment } from './comment';

export interface MemeVote {
  user: string | User;
  voteType: 'up' | 'down';
}

export interface Meme {
  _id: string;
  title: string;
  imageUrl: string;
  tags: string[];
  upvotes: number;
  downvotes: number;
  createdAt: Date | string;
  comments?: Comment[];
  firstCommentTimestamp?: Date | string;
  uploaderUsername?: string;
  uploader: {
    _id: string;
    username: string;
  };
}
