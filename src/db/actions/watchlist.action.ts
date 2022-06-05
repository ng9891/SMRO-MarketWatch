import db from '../firebase';
import {FieldValue, QuerySnapshot} from 'firebase-admin/firestore';
import {add, getUnixTime, fromUnixTime} from 'date-fns';
import {Watchlist} from '../../ts/interfaces/Watchlist';
import {AppUser} from '../../ts/interfaces/AppUser';
import {Scrape} from '../../ts/interfaces/Scrape';
import {List} from '../../ts/interfaces/List';
import {calculateNextExec} from '../../helpers/helpers';
import {ServerName} from '../../ts/types/ServerName';

const watchlistRef = db.collection('Watchlist');

export const getWatchListInfo = async (itemID: string, server: ServerName): Promise<Watchlist | null> => {
  const snap = await watchlistRef.doc(server + itemID).get();
  return snap.exists ? (snap.data() as Watchlist) : null;
};

export const getActiveWatchLists = async (subs = 1): Promise<QuerySnapshot> => {
  const snap = await watchlistRef.where('subs', '>=', subs).get();
  return snap;
};

export const createNewWatchList = async (recurrence: number, user: AppUser, scrape: Scrape): Promise<Watchlist> => {
  const {itemID, name: itemName, timestamp, server} = scrape;
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
    server,
  };

  await watchlistRef.doc(server + itemID).set(wl, {merge: true});
  return wl;
};

export const updateWatchLists = async (list: Watchlist[]): Promise<Watchlist[]> => {
  const batch = db.batch();
  const newList = list.map((wl) => {
    const {itemID, recurrence, setByID, setByName, setOn, server} = wl;

    const now = new Date();
    const nextOn = getUnixTime(calculateNextExec(setOn, now, recurrence));

    const update = {recurrence, setByID, setByName, nextOn, setOn};
    batch.update(watchlistRef.doc(server + itemID), update);

    return Object.assign(wl, update) as Watchlist;
  });
  await batch.commit();
  return newList;
};

export const addSub = async (list: List): Promise<boolean> => {
  const {itemID, userID, server} = list;
  const subsRef = watchlistRef.doc(server + itemID).collection('Subs');
  const snap = await subsRef.doc(userID).get();
  let newSub = false;
  if (!snap.exists) {
    await watchlistRef.doc(server + itemID).set({subs: FieldValue.increment(1)}, {merge: true});
    newSub = true;
  }
  await watchlistRef.doc(server + itemID).set({lastSubChangeOn: getUnixTime(new Date())}, {merge: true});
  await subsRef.doc(userID).set({...list});
  return newSub;
};

export const unSub = async (itemID: string, userID: string, server: ServerName): Promise<void> => {
  await watchlistRef
    .doc(server + itemID)
    .collection('Subs')
    .doc(userID)
    .delete();
  await watchlistRef.doc(server + itemID).set({lastSubChangeOn: getUnixTime(new Date())}, {merge: true});
  await watchlistRef.doc(server + itemID).set({subs: FieldValue.increment(-1)}, {merge: true});
};

export const getSubs = async (itemID: string, server: ServerName): Promise<List[] | null> => {
  const snap = await watchlistRef
    .doc(server + itemID)
    .collection('Subs')
    .get();
  return snap.empty ? null : snap.docs.map((snapUser) => snapUser.data() as List);
};
