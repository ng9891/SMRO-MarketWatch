import {FieldValue} from 'firebase-admin/firestore';
import {Scrape} from '../../ts/interfaces/Scrape';
import {ServerName} from '../../ts/types/ServerName';
import db from '../firebase';

const itemsRef = db.collection('Items');

export const getItemInfo = async (itemID: string, server: ServerName): Promise<Scrape | null> => {
  const snap = await itemsRef.doc(server + itemID).get();
  return snap.exists ? snap.data() as Scrape : null;
};

export const setItemInfo = async (scrape: Scrape, userID: string): Promise<void> => {
  const {vends, timestamp, watchHistory, itemID, server, ...rest} = scrape;
  await itemsRef.doc(server + itemID).set(
    {
      ...rest,
      itemID,
      server,
      watchHistory: FieldValue.arrayUnion(userID),
    },
    {merge: true}
  );
};
