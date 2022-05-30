// Entry to watchlist. A subscriber.
export interface List {
  itemID: string;
  itemName: string;
  userID: string;
  userName: string;
  threshold: number;
  refinement?: string | null;
  timestamp: number;
  history?: string[];
}
