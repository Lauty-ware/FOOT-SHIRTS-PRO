import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase-config';

async function iniciarSesion(email, password) {
  try {
    // Autenticar usuario
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Obtener datos adicionales
    const docRef = doc(db, "usuarios", user.uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const userData = docSnap.data();
      console.log("Bienvenido:", userData.nombre_completo);
      return { ...user, ...userData };
    }
  } catch (error) {
    console.error("Error al iniciar sesión:", error.message);
    throw error;
  }
}