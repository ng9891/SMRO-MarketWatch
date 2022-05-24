import db from '../firebase';
import {add} from 'date-fns';
import getUnixTime from 'date-fns/getUnixTime';
import fromUnixTime from 'date-fns/fromUnixTime';
import {Watchlist} from '../../ts/interfaces/Watchlist';
import {AppUser} from '../../ts/interfaces/AppUser';
import {Scrape} from '../../ts/interfaces/Scrape';
import {List} from '../../ts/interfaces/List';

const watchlistRef = db.collection('Watchlist');

export const getWatchListInfo = async (itemID: string) => {
  const snap = await watchlistRef.doc(itemID).get();
  if (!snap.exists) return null;
  return snap.data() as Watchlist;
};

export const setWatchListInfo = async (recurrence: number, user: AppUser, scrape: Scrape): Promise<Watchlist> => {
  const {itemID, name: itemName, timestamp} = scrape;
  const {userID, userName} = user;

  const now = fromUnixTime(timestamp);
  const nextOn = getUnixTime(add(now, {minutes: recurrence}));
  const setOn = getUnixTime(now);

  const wl = {
    recurrence,
    itemID,
    itemName,
    setOn,
    nextOn,
    setByID: userID,
    setByName: userName,
  };

  await watchlistRef.doc(itemID).set(wl);

  return wl;
};

export const addSub = async (list: List) => {
  const {itemID, userID} = list;
  await watchlistRef.doc(itemID).collection('subs').doc(userID).set(list);
};
