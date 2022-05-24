import db from '../firebase';
import {AppUser} from '../../ts/interfaces/AppUser';

const usersRef = db.collection('User');

export const getUserInfo = async (userID: string) => {
  const snap = await usersRef.doc(userID).get();
  if (!snap.exists) return null;
  return snap.data() as AppUser;
};

export const setUserInfo = async (user: AppUser): Promise<AppUser> => {
  const {userID, userName, list} = user;
  const listSize = list ? Object.keys(list).length : 0;
  await usersRef.doc(userID).set({userID, userName, list: {...list}, listSize});
  return {...user, listSize};
};
