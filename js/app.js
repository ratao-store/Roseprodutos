import { auth, googleProvider, db } from './firebase.js';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  collection, 
  getDocs 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 1. Configurar Login com Google
const btnGoogle = document.getElementById('btn-google-login');
if (btnGoogle) {
  btnGoogle.addEventListener('click', async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      alert(`Bem-vindo(a), ${result.user.displayName || 'Utilizador'}!`);
    } catch (error) {
      console.error("Erro no login Google:", error);
      alert("Erro ao entrar com o Google: " + error.message);
    }
  });
}

// 2. Configurar Login com E-mail e Senha
const formLogin = document.getElementById('form-login');
if (formLogin) {
  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const inputs = formLogin.querySelectorAll('input');
    const email = inputs[0].value;
    const senha = inputs[1].value;

    try {
      await signInWithEmailAndPassword(auth, email, senha);
      alert("Login efetuado com sucesso!");
    } catch (error) {
      console.error("Erro no login por e-mail:", error);
      alert("Erro ao entrar: Verifique o e-mail e a senha digitados.");
    }
  });
}

// 3. Carregar Produtos do Firestore na Grelha (Bento Grid)
async function carregarProdutos() {
  const container = document.getElementById('produtos-container');
  if (!container) return;

  try {
    const querySnapshot = await getDocs(collection(db, "produtos"));
    container.innerHTML = ""; // Limpa a mensagem/conteúdo anterior

    if (querySnapshot.empty) {
      container.innerHTML = "<p style='grid-column: 1/-1; text-align: center; color: var(--text-muted);'>Nenhum produto cadastrado no momento.</p>";
      return;
    }

    querySnapshot.forEach((doc) => {
      const p = doc.data();
      const card = document.createElement('div');
      card.className = 'product-card';
      
      card.innerHTML = `
        <img src="${p.imagem || 'https://via.placeholder.com/300'}" class="product-img" alt="${p.nome}">
        <div class="product-info">
          <span class="product-category">${p.categoria || 'Natura'}</span>
          <h3 class="product-title">${p.nome}</h3>
          <div class="product-price">R$ ${parseFloat(p.preco || 0).toFixed(2)}</div>
          <button class="btn-reserve" onclick="alert('Inicie sessão para reservar!')">Reservar</button>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
  }
}

// Executa a procura de produtos assim que a página carrega
carregarProdutos();
