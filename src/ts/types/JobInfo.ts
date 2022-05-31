import {Watchlist} from '../interfaces/Watchlist';
import schedule from 'node-schedule';

export type JobInfo = {wl: Watchlist; job: schedule.Job};
