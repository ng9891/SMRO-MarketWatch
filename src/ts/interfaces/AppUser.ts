import {List} from './List';

export interface AppUser {
  userID: string;
  userName: string;
  discriminator: string;
  list?: {
    [key: string]: List;
  };
  listSize?: number;
  timestamp?: number;
}
