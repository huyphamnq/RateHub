export type UserProfile = {
  id: string;
  displayName: string;
  email: string;
  photoURL: string;
  bio?: string;
  role?: 'user' | 'admin';
};

export type Review = {
  id: string;
  title: string;
  content: string;
  rating: number;
  category: 'movie' | 'book' | 'game';
  authorId: string;
  createdAt: any; // Allow for server-side timestamp
  upvotes: number;
  downvotes: number;
  upvotedBy: string[];
  downvotedBy: string[];
  imageUrl: string;
  imageHint: string;
  year: number;
  genre: string;
};

export type Comment = {
  id: string;
  authorId: string;
  author: {
    displayName: string;
    photoURL?: string;
  };
  content: string;
  createdAt: any; // Allow for server-side timestamp
};

export type SentimentData = {
  month: string;
  positive: number;
  negative: number;
  neutral: number;
};
