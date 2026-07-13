import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase-config';

async function publicarCamiseta(data) {
  try {
    const docRef = await addDoc(collection(db, "publicaciones"), {
      nombre: data.nombre,
      descripcion: data.descripcion,
      precio: data.precio,
      id_usuario: data.id_usuario, // UID del vendedor
      imagenes: data.imagenes || [], // Array de URLs
      fecha_publicacion: serverTimestamp(),
     });
    
    console.log("Publicación creada con ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error al publicar:", error.message);
    throw error;
  }
}