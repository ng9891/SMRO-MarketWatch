import {VendInfo} from './VendInfo';
import {ServerName} from '../types/ServerName';
export interface Scrape {
  itemID: string;
  name: string;
  type: string;
  equipLocation: string;
  server: ServerName;
  timestamp: number;
  vends?: VendInfo[];
  watchHistory?: string[];
}
