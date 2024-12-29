import { initializeApp } from "firebase/app";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// Función para obtener la ruta de la imagen desde una URL
const getPathFromURL = (url: string) => {
  try {
    const pathname = new URL(url).pathname;
    const path = pathname.split("/o/")[1];
    if (path) {
      return decodeURIComponent(path);
    }
    return url;
  } catch (error) {
    return url;
  }
};

export const uploadImage = async (file: File): Promise<string> => {
  const storageRef = ref(storage, `gallery/${Date.now()}_${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
};

export const deleteImageFromStorage = async (url: string) => {
  try {
    if (url.startsWith("blob:")) {
      // Si es una URL blob, solo retornamos ya que estas URLs son temporales
      return;
    }

    const path = getPathFromURL(url);
    const imageRef = ref(storage, path);
    await deleteObject(imageRef);
  } catch (error) {
    console.error("Error deleting image from storage:", error);
    throw error;
  }
};

export { storage };
