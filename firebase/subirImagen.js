import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase-config';

async function subirImagen(file, carpeta = "camisetas") {
  try {
    const nombreUnico = Date.now() + "_" + file.name;
    const storageRef = ref(storage, `${carpeta}/${nombreUnico}`);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    console.log("Imagen subida:", downloadURL);
    return downloadURL;
  } catch (error) {
    console.error("Error al subir imagen:", error.message);
    throw error;
  }
}