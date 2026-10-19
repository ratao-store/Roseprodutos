import { auth, googleProvider } from './firebase.js';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// 1. Login com o Google
const btnGoogle = document.getElementById('btn-google-login');
if (btnGoogle) {
  btnGoogle.addEventListener('click', async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      alert(`Bem-vindo(a), ${result.user.displayName}!`);
    } catch (error) {
      console.error("Erro no login Google:", error);
      alert("Erro ao entrar com Google: " + error.message);
    }
  });
}

// 2. Login com E-mail e Senha
const formLogin = document.getElementById('form-login');
if (formLogin) {
  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Captura os inputs dentro do formulário
    const inputs = formLogin.querySelectorAll('input');
    const email = inputs[0].value;
    const senha = inputs[1].value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      alert(`Login efetuado com sucesso!`);
    } catch (error) {
      console.error("Erro no login tradicional:", error);
      alert("Erro ao entrar: Verifique o e-mail e a senha.");
    }
  });
}
