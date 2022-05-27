import db from '../firebase';
import {FieldValue} from 'firebase-admin/firestore';
import {add, getUnixTime, fromUnixTime} from 'date-fns';
import {Watchlist} from '../../ts/interfaces/Watchlist';
import {AppUser} from '../../ts/interfaces/AppUser';
import {Scrape} from '../../ts/interfaces/Scrape';
import {List} from '../../ts/interfaces/List';
import {calculateNextExec} from '../../helpers/helpers';

const watchlistRef = db.collection('Watchlist');

export const getWatchListInfo = async (itemID: string): Promise<Watchlist | null> => {
  const snap = await watchlistRef.doc(itemID).get();
  if (!snap.exists) return null;
  return snap.data() as Watchlist;
};

export const createNewWatchList = async (recurrence: number, user: AppUser, scrape: Scrape): Promise<Watchlist> => {
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
    subs: 0,
  };

  await watchlistRef.doc(itemID).set(wl, {merge: true});
  return wl;
};

export const updateWatchList = async (wl: Watchlist): Promise<Watchlist> => {
  const {recurrence, setByID, setByName, setOn} = wl;

  const now = new Date();
  const nextOn = getUnixTime(calculateNextExec(setOn, now, recurrence));

  const update = {recurrence, setByID, setByName, nextOn, setOn};
  await watchlistRef.doc(wl.itemID).update(update);

  return Object.assign(wl, update) as Watchlist;
};

export const addSub = async (list: List): Promise<boolean> => {
  const {itemID, userID} = list;
  const subsRef = watchlistRef.doc(itemID).collection('Subs');
  const snap = await subsRef.doc(userID).get();
  let newSub = false;
  if (!snap.exists) {
    await watchlistRef.doc(itemID).set({subs: FieldValue.increment(1)}, {merge: true});
    newSub = true;
  }
  await subsRef.doc(userID).set(list);
  return newSub;
};

export const unSub = async (itemID: string, userID: string): Promise<void> => {
  await watchlistRef.doc(itemID).collection('Subs').doc(userID).delete();
  const snap = await watchlistRef.doc(itemID).get();
  if (snap.exists) {
    const data = snap.data();
    if (data && data.subs > 0) await watchlistRef.doc(itemID).set({subs: FieldValue.increment(-1)}, {merge: true});
  } else {
    console.error('Unsubscribing a user not subscribed to:' + itemID);
  }
};
