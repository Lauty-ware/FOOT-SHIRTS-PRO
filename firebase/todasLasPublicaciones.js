import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from './firebase-config';

async function obtenerPublicaciones() {
  try {
    const q = query(
      collection(db, "publicaciones"),
      where("activo", "==", true),
      orderBy("fecha_publicacion", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    const publicaciones = [];
    
    querySnapshot.forEach((doc) => {
      publicaciones.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return publicaciones;
  } catch (error) {
    console.error("Error al obtener publicaciones:", error.message);
    throw error;
  }
}