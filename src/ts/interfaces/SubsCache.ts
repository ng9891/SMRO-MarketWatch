import {ServerName} from '../types/ServerName';
import {List} from './List';

export interface SubsCache {
  data: List[];
  lastSubChangeOn: Date;
  server: ServerName;
  itemID: string;
}
