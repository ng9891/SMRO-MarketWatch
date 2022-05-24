import {List} from './List';
export interface AppUser {
  userID: string;
  userName: string;
  list?: {
    [key: string]: List;
  };
  listSize?: number;
}
