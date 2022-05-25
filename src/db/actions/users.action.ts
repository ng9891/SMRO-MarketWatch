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
  const newList = list ? list : {};
  const listSize = Object.keys(newList).length;
  await usersRef.doc(userID).set({userID, userName, list: {...newList}, listSize});
  return {...user, listSize};
};
