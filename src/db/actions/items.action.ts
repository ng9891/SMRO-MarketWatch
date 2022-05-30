import {FieldValue} from 'firebase-admin/firestore';
import {Scrape} from '../../ts/interfaces/Scrape';
import db from '../firebase';

const itemsRef = db.collection('Items');

export const getItemInfo = async (itemID: string): Promise<Scrape | null> => {
  const snap = await itemsRef.doc(itemID).get();
  if (!snap.exists) return null;
  return snap.data() as Scrape;
};

export const setItemInfo = async (scrape: Scrape, userID: string): Promise<void> => {
  const {vends, timestamp, watchHistory, itemID, ...rest} = scrape;
  await itemsRef.doc(itemID).set(
    {
      itemID,
      ...rest,
      watchHistory: FieldValue.arrayUnion(userID),
    },
    {merge: true}
  );
};
