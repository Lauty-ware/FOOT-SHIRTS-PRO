import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase-config';

async function registrarUsuario(email, password, nombreCompleto) {
  try {
    // Crear usuario en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Guardar datos adicionales en Firestore
    await setDoc(doc(db, "usuarios", user.uid), {
      nombre_completo: nombreCompleto,
      email: email,
      fecha_registro: new Date()
    });
    
    console.log("Usuario registrado exitosamente");
    return user;
  } catch (error) {
    console.error("Error al registrar:", error.message);
    throw error;
  }
}
