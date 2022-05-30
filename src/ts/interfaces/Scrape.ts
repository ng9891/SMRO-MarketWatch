import {VendInfo} from './VendInfo';
export interface Scrape {
  itemID: string;
  name: string;
  type: string;
  equipLocation: string;
  timestamp: number;
  vends?: VendInfo[];
  watchHistory?: string[];
}
