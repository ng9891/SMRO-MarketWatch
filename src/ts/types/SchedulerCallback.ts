import { Watchlist } from "../interfaces/Watchlist";
export type SchedulerCallBack = (wl: Watchlist) => void | Promise<Watchlist>;
