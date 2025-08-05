export interface TodoItem {
  id: string;           // uuid
  userId: string;       // uuid, foreign key
  title: string;
  description?: string | null;
  isDone: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserInfo {
  id: string;           // uuid
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}