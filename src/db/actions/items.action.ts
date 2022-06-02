import {FieldValue} from 'firebase-admin/firestore';
import {Scrape} from '../../ts/interfaces/Scrape';
import {ServerName} from '../../ts/types/ServerName';
import db from '../firebase';

const itemsRef = db.collection('Items');

export const getItemInfo = async (itemID: string, server: ServerName): Promise<Scrape | null> => {
  const snap = await itemsRef.doc(server + itemID).get();
  if (!snap.exists) return null;
  return snap.data() as Scrape;
};

export const setItemInfo = async (scrape: Scrape, userID: string): Promise<void> => {
  const {vends, timestamp, watchHistory, itemID, server, ...rest} = scrape;
  await itemsRef.doc(server + itemID).set(
    {
      itemID,
      server,
      ...rest,
      watchHistory: FieldValue.arrayUnion(userID),
    },
    {merge: true}
  );
};
