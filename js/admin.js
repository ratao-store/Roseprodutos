import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Configuração direta para evitar cache no GitHub Pages
const firebaseConfig = {
  apiKey: "AIzaSyBkKGgytdELAWzW0pypCYSqvJyACc1yn98",
  authDomain: "rose-produtos.firebaseapp.com",
  projectId: "rose-produtos",
  storageBucket: "rose-produtos.firebasestorage.app",
  messagingSenderId: "794373598349",
  appId: "1:794373598349:web:7cc702a65c01a764fd06c4",
  measurementId: "G-KPC6MS2J2W"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const loginBox = document.getElementById('admin-login-box');
const adminContent = document.getElementById('admin-content');
const formAdminLogin = document.getElementById('form-admin-login');

onAuthStateChanged(auth, (user) => {
  if (user) {
    if (loginBox) loginBox.style.display = 'none';
    if (adminContent) adminContent.style.display = 'block';
    carregarProdutosAdmin();
  } else {
    if (loginBox) loginBox.style.display = 'block';
    if (adminContent) adminContent.style.display = 'none';
  }
});

if (formAdminLogin) {
  formAdminLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    const inputs = formAdminLogin.querySelectorAll('input');
    const email = inputs[0].value.trim();
    const senha = inputs[1].value;

    try {
      await signInWithEmailAndPassword(auth, email, senha);
      alert("Login efetuado com sucesso!");
    } catch (error) {
      alert("Erro ao entrar: " + error.message);
    }
  });
}

const formProduto = document.getElementById('form-produto');
if (formProduto) {
  formProduto.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nome = document.getElementById('prod-nome').value;
    const preco = document.getElementById('prod-preco').value;
    const imagem = document.getElementById('prod-img').value;

    try {
      await addDoc(collection(db, "produtos"), {
        nome,
        preco: Number(preco),
        imagem,
        categoria: "Natura",
        criadoEm: new Date()
      });
      alert("Produto cadastrado com sucesso!");
      formProduto.reset();
      carregarProdutosAdmin();
    } catch (error) {
      alert("Erro ao salvar produto: " + error.message);
    }
  });
}

async function carregarProdutosAdmin() {
  const listaContainer = document.getElementById('admin-produtos-lista');
  if (!listaContainer) return;

  try {
    const querySnapshot = await getDocs(collection(db, "produtos"));
    listaContainer.innerHTML = "";

    if (querySnapshot.empty) {
      listaContainer.innerHTML = "<p style='color: var(--text-muted);'>Nenhum produto cadastrado.</p>";
      return;
    }

    querySnapshot.forEach((documento) => {
      const p = documento.data();
      const div = document.createElement('div');
      div.style.cssText = "display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--border-color);";
      
      div.innerHTML = `
        <div>
          <strong>${p.nome}</strong> - R$ ${Number(p.preco).toFixed(2)}
        </div>
        <button type="button" onclick="window.removerProduto('${documento.id}')" style="background: #ff4d4d; color: white; border: none; padding: 6px 12px; border-radius: 8px; cursor: pointer;">Excluir</button>
      `;
      listaContainer.appendChild(div);
    });
  } catch (error) {
    console.error("Erro ao carregar lista:", error);
  }
}

window.removerProduto = async function(id) {
  if (confirm("Tem certeza que deseja apagar este produto?")) {
    try {
      await deleteDoc(doc(db, "produtos", id));
      alert("Produto apagado!");
      carregarProdutosAdmin();
    } catch (error) {
      console.error("Erro ao apagar:", error);
    }
  }
};
