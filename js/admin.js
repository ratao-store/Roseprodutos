import { auth, db } from './firebase.js';
import { 
  signInWithEmailAndPassword, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const loginBox = document.getElementById('admin-login-box');
const adminContent = document.getElementById('admin-content');
const formAdminLogin = document.getElementById('form-admin-login');

// 1. Verificar se o utilizador já está logado
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Utilizador autenticado: esconde o login e mostra o painel
    if (loginBox) loginBox.style.display = 'none';
    if (adminContent) adminContent.style.display = 'block';
    carregarProdutosAdmin();
  } else {
    // Não autenticado: mostra o login e esconde o painel
    if (loginBox) loginBox.style.display = 'block';
    if (adminContent) adminContent.style.display = 'none';
  }
});

// 2. Fazer login no painel
if (formAdminLogin) {
  formAdminLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    const inputs = formAdminLogin.querySelectorAll('input');
    const email = inputs[0].value;
    const senha = inputs[1].value;

    try {
      await signInWithEmailAndPassword(auth, email, senha);
      alert("Acesso autorizado!");
    } catch (error) {
      console.error("Erro no login admin:", error);
      alert("Erro ao entrar: Verifique o e-mail e a senha.");
    }
  });
}

// 3. Cadastrar Novo Produto no Firestore
const formProduto = document.getElementById('form-produto');
if (formProduto) {
  formProduto.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = document.getElementById('prod-nome').value;
    const preco = document.getElementById('prod-preco').value;
    const imagem = document.getElementById('prod-img').value;

    try {
      await addDoc(collection(db, "produtos"), {
        nome: nome,
        preco: Number(preco),
        imagem: imagem,
        categoria: "Natura",
        criadoEm: new Date()
      });

      alert("Produto cadastrado com sucesso!");
      formProduto.reset();
      carregarProdutosAdmin();
    } catch (error) {
      console.error("Erro ao cadastrar produto:", error);
      alert("Erro ao salvar produto: " + error.message);
    }
  });
}

// 4. Listar Produtos no Painel Admin
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
        <button onclick="window.removerProduto('${documento.id}')" style="background: #ff4d4d; color: white; border: none; padding: 6px 12px; border-radius: 8px; cursor: pointer;">Excluir</button>
      `;
      listaContainer.appendChild(div);
    });
  } catch (error) {
    console.error("Erro ao carregar lista:", error);
  }
}

// Função global para excluir produto
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
