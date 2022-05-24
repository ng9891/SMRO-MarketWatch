export interface List {
  itemID: string;
  itemName: string;
  userID:string;
  userName:string;
  threshold: number;
  refinement?: string | null;
  timestamp: number;
}
