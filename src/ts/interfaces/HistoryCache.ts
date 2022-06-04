import {ServerName} from '../types/ServerName';
import {VendInfo} from './VendInfo';

export interface HistoryCache {
  data: VendInfo[];
  lastUpdated: Date;
  server: ServerName;
  itemID: string;
}
