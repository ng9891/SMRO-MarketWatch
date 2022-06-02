import {ServerName} from '../types/ServerName';
export interface Watchlist {
  itemID: string;
  itemName: string;
  recurrence: number;
  setByID: string;
  setByName: string;
  setOn: number;
  nextOn: number;
  createdOn: number;
  server: ServerName;
  subs?: number;
}
