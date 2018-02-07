import idb from 'idb';

const initIndexDB = () => {
  if (!('indexedDB' in window)) {
    console.error('This browser doesn\'t support IndexedDB');
    return null;
  }

  const dbPromise = idb.open(`${window.location.hostname}-db`, 1, (upgradeDb) => {
    if (!upgradeDb.objectStoreNames.contains('images')) {
      upgradeDb.createObjectStore('images');
    }
  });

  return dbPromise;
};

const dbPromise = initIndexDB();

export default dbPromise;
