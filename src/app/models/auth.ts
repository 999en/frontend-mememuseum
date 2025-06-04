export interface AuthRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    _id: string;
    username: string;
  };
}

export interface AuthError {
  message: string;
  status: number;
}
