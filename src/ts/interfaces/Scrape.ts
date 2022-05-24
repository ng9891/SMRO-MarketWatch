import { VendInfo } from "./VendInfo";
export interface Scrape {
  itemID:string,
  name:string,
  type:string,
  equipLocation?:string,
  timestamp:number,
  vend?: VendInfo[],
}