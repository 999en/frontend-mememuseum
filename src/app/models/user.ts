export interface User {
  _id: string;
  username: string;
  // password is never exposed on frontend
  createdAt?: string;
  updatedAt?: string;
}
