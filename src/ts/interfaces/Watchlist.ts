// import {AppUser} from './AppUser'
export interface Watchlist {
  itemID: string;
  itemName: string;
  recurrence: number;
  setByID: string;
  setByName: string;
  setOn: number;
  nextOn: number;
  createdOn: number;
  subs?: number;
}
