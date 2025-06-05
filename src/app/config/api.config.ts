export const API_CONFIG = {
  BASE_URL: 'http://localhost:5000/api',
  UPLOADS_PATH: '/uploads',
  ENDPOINTS: {
    MEMES: '/memes',
    COMMENTS: '/comments',
    VOTES: '/votes',
    AUTH: '/auth'
  },
  SUPPORTED_FORMATS: ['image/jpeg', 'image/png', 'image/gif'],
  MAX_FILE_SIZE: 10 * 1024 * 1024 // 10MB in bytes
};
