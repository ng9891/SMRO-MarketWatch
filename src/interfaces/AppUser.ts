export interface AppUser {
  userID:string,
  threshold:number,
  name?:string,
  watching?: number[],
  listSize?: number
}
