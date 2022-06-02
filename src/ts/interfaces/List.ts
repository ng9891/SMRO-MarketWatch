// Entry to watchlist. A subscriber.
import {ServerName} from '../types/ServerName';
export interface List {
  itemID: string;
  itemName: string;
  userID: string;
  userName: string;
  threshold: number;
  refinement?: string | null;
  server: ServerName;
  timestamp: number;
  history?: string[];
}
