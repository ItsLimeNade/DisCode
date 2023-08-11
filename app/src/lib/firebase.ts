
import { initializeApp } from "firebase/app";
import { getFirestore, onSnapshot,doc } from "firebase/firestore";
import { getAuth, onAuthStateChanged, type User } from "firebase/auth";
import { getStorage } from "firebase/storage"


import { writable,derived, type Readable } from "svelte/store";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBFXWaWmDS5ZldpFjsEdpb60I5e09Ph3uA",
    authDomain: "discodes-6db31.firebaseapp.com",
    projectId: "discodes-6db31",
    storageBucket: "discodes-6db31.appspot.com",
    messagingSenderId: "787808719564",
    appId: "1:787808719564:web:2923ff159d3390bacd6869",
    measurementId: "G-EZBW41H5NJ"
};


export const app = initializeApp(firebaseConfig);
export const db = getFirestore();
export const auth = getAuth();
export const storage = getStorage();





function userStore() {
    let unsubscribe: () => void;
  
    if (!auth || !globalThis.window) {
      console.warn('Auth is not initialized or not in browser');
      const { subscribe } = writable<User | null>(null);
      return {
        subscribe,
      }
    }
  
    const { subscribe } = writable(auth?.currentUser ?? null, (set) => {
      unsubscribe = onAuthStateChanged(auth, (user) => {
        set(user);
      });
  
      return () => unsubscribe();
    });
  
    return {
      subscribe,
    };
  }
  
  export const user = userStore();



  /**
 * @param  {string} path document path or reference
 * @returns a store with realtime updates on document data
 */
export function docStore<T>(
  path: string,
) {
  let unsubscribe: () => void;

  const docRef = doc(db, path);

  const { subscribe } = writable<T | null>(null, (set) => {
    unsubscribe = onSnapshot(docRef, (snapshot) => {
      set((snapshot.data() as T) ?? null);
    });

    return () => unsubscribe();
  });

  return {
    subscribe,
    ref: docRef,
    id: docRef.id,
  };
}

interface UserData {
  username: string;
  bio: string;
  photoURL: string;
  links: any[];
}

export const userData: Readable<UserData | null> = derived(user, ($user, set) => { 
  if ($user) {
    return docStore<UserData>(`users/${$user.uid}`).subscribe(set);
  } else {
    set(null); 
  }
});  