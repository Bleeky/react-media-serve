import request from 'request';
import Wrapper from '../api';
import store from 'store';

const serveFile = (uuid, fetchMedia, mediaArgs, dbPromise) => {
  let hasCanceled = false;

  return {
    call: () => dbPromise.then(db => db.transaction('medias')
      .objectStore('medias').get(uuid)).then(
      async (val) => {
        if (hasCanceled) {
          return null;
        }
        if (!val) {
            return fetchMedia(mediaArgs).then((res) => {
              dbPromise.then((db) => {
                const tx = db.transaction('images', 'readwrite');
                tx.objectStore('images').put(response, `${hash}[${size}]`);
                return tx.complete;
              });
              if (hasCanceled) {
                return null;
              }
              if (objURL) {
                return URL.createObjectURL(response);
              }
              return response;
            }).catch(err => {
              if (hasCanceled) {
                return null;
              }
              return loadingPic;
            });
          }
        return URL.createObjectURL(val);
      }),
    cancel() {
      hasCanceled = true;
    },
  };
};

export default serveFile;
