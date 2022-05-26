import {List} from './List';

export type listKey = keyof AppUser['list'];

export interface AppUser {
  userID: string;
  userName: string;
  list?: {
    [key: string]: List;
  };
  listSize?: number;
  timestamp?: number;
}
