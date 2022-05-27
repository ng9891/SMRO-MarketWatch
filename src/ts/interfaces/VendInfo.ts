export interface VendInfo {
  shopID: string | undefined;
  shopName: string;
  price: number;
  amount: number;
  card0: string;
  card1: string;
  card2: string;
  card3: string;
  itemID: string;
  itemName: string;
  refinement: string;
  option1: string;
  option2: string;
  option3: string;
  hash?: string;
  timestamp?: number;
}
