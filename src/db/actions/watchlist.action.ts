import db from '../firebase';
import {FieldValue} from 'firebase-admin/firestore';
import {add, getUnixTime, fromUnixTime} from 'date-fns';
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
    createdOn: timestamp,
  };

  await watchlistRef.doc(itemID).set(wl, {merge: true});
  return wl;
};

export const addSub = async (list: List) => {
  const {itemID, userID} = list;
  const snap = await watchlistRef.doc(itemID).collection('subs').doc(userID).get();
  let newSub = false;
  if (!snap.exists) {
    await watchlistRef.doc(itemID).set({subs: FieldValue.increment(1)}, {merge: true});
    newSub = true;
  }
  await watchlistRef.doc(itemID).collection('subs').doc(userID).set(list);
  return newSub;
};

export const updateRecurrence = async (wl: Watchlist): Promise<Watchlist> => {
  const {setByID, setByName, recurrence} = wl;

  const now = new Date();
  const nextOn = getUnixTime(add(now, {minutes: recurrence}));
  const setOn = getUnixTime(now);

  const newWl = {
    recurrence,
    setOn,
    nextOn,
    setByID,
    setByName,
  };

  await watchlistRef.doc(wl.itemID).update(newWl);
  return Object.assign(wl, newWl);
};
