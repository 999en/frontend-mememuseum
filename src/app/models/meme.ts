import { User } from './user';

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
  createdAt: Date; // Remove the optional marker
  comments?: Comment[];
  firstCommentTimestamp?: Date;
  uploaderUsername?: string;
  uploader: string | User; // Add this line to fix the TypeScript errors
}

interface Comment {
  _id: string;
  content: string;
  createdAt: Date;
  // altri campi del commento se necessari
}
