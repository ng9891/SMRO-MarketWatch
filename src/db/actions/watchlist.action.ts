import db from '../firebase';
import {convertToUnixSecond} from '../../helpers/helpers';

const watchlistRef = db.collection('watchlist');

export const addSub = async (userID: string, itemID: string, threshold: number) => {
  const set = await watchlistRef
    .doc(itemID.toString())
    .collection('subs')
    .doc(userID?.toString())
    .set({
      itemID,
      userID,
      threshold,
      timestamp: convertToUnixSecond(new Date()),
    });

  console.log('ADDED!');
};
