import { Request } from 'express';

export type AuthedUser = {
  _id: string;
  email: string;
  role: 'ADMIN' | 'MEMBER';
};

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthedUser;
  }
}
