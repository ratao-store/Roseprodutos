import { 
  auth, db, googleProvider, signInWithPopup, signOut, onAuthStateChanged, 
  collection, doc, getDoc, setDoc, updateDoc, onSnapshot 
} from "./firebase.js";

const NUMERO_WHATSAPP = "5511999999999"; // Coloque o número do WhatsApp com DDD aqui
let currentUser = null;
let carrinho = [];
let produtosCache = [];

const btnLogin = document.getElementById("btn-login-google");
const btnLogout = document.getElementById("btn-logout");
const userInfo = document.getElementById("user-info");
const userName = document.getElementById("user-name");
const gridProdutos = document.getElementById("grid-produtos");

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const banDoc = await getDoc(doc(db, "banidos", user.uid));
    if (banDoc.exists()) {
      alert("Sua conta foi suspensa de acessar o site.");
      await signOut(auth);
      return;
    }

    currentUser = user;
    userName.textContent = `Olá, ${user.displayName.split(' ')[0]}`;
    userInfo.classList.remove("hidden");
    btnLogin.classList.add("hidden");

    await setDoc(doc(db, "usuarios", user.uid), {
      nome: user.displayName,
      email: user.email,
      ultimoAcesso: new Date()
    }, { merge: true });

  } else {
    currentUser = null;
    userInfo.classList.add("hidden");
    btnLogin.classList.remove("hidden");
  }
  renderizarProdutos();
});

btnLogin.addEventListener("click", async () => {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (err) {
    alert("Erro ao entrar com Google.");
  }
});

btnLogout.addEventListener("click", () => signOut(auth));

onSnapshot(collection(db, "produtos"), (snapshot) => {
  produtosCache = [];
  snapshot.forEach(docSnap => {
    produtosCache.push({ id: docSnap.id, ...docSnap.data() });
  });
  renderizarProdutos();
});

function renderizarProdutos() {
  gridProdutos.innerHTML = "";
  const agora = new Date();

  produtosCache.forEach(p => {
    let estaReservado = false;
    let reservadoPorMim = false;

    if (p.reserva) {
      const dataExpira = p.reserva.expiraEm.toDate ? p.reserva.expiraEm.toDate() : new Date(p.reserva.expiraEm);
      if (agora < dataExpira) {
        estaReservado = true;
        if (currentUser && p.reserva.userId === currentUser.uid) {
          reservadoPorMim = true;
        }
      }
    }

    const card = document.createElement("div");
    card.className = "card-produto";
    
    let badgeHTML = estaReservado 
      ? `<span class="status-badge badge-reservado">${reservadoPorMim ? 'Reservado por você' : 'Reservado'}</span>`
      : `<span class="status-badge badge-disponivel">Disponível</span>`;

    let botoesAcao = "";
    if (estaReservado && !reservadoPorMim) {
      botoesAcao = `<p style="color: #ff8c00; font-size: 0.85rem;">Indisponível temporariamente</p>`;
    } else {
      botoesAcao = `
        <button class="btn btn-rosa" onclick="adicionarCarrinho('${p.id}')">🛒 Adicionar</button>
        ${!estaReservado ? `<button class="btn btn-reserva" onclick="reservarProduto('${p.id}')">⏳ Reservar (2 dias)</button>` : ''}
      `;
    }

    card.innerHTML = `
      ${badgeHTML}
      <img src="${p.imagem || 'https://via.placeholder.com/200'}" alt="${p.nome}">
      <div class="card-body">
        <h3 class="card-title">${p.nome}</h3>
        <p class="card-price">R$ ${Number(p.preco).toFixed(2)}</p>
        <div style="display: flex; gap: 5px; flex-direction: column; margin-top: auto;">
          ${botoesAcao}
        </div>
      </div>
    `;
    gridProdutos.appendChild(card);
  });
}

window.reservarProduto = async (prodId) => {
  if (!currentUser) {
    alert("Você precisa fazer login com sua conta do Google para reservar um produto!");
    return;
  }

  const expira = new Date();
  expira.setDate(expira.getDate() + 2);

  try {
    await updateDoc(doc(db, "produtos", prodId), {
      reserva: {
        userId: currentUser.uid,
        userName: currentUser.displayName,
        expiraEm: expira
      }
    });

    const p = produtosCache.find(item => item.id === prodId);
    const msg = encodeURIComponent(`Olá Rose! Acabei de reservar o produto "${p.nome}" no site por 2 dias. Meu nome é ${currentUser.displayName}.`);
    window.open(`https://wa.me/${NUMERO_WHATSAPP}?text=${msg}`, '_blank');

    alert("Produto reservado com sucesso por 2 dias!");
  } catch (err) {
    alert("Erro ao realizar reserva.");
  }
};

window.adicionarCarrinho = (prodId) => {
  const p = produtosCache.find(item => item.id === prodId);
  carrinho.push(p);
  atualizarCarrinhoUI();
};

function atualizarCarrinhoUI() {
  document.getElementById("cart-count").textContent = carrinho.length;
  const itemsDiv = document.getElementById("cart-items");
  itemsDiv.innerHTML = "";

  let total = 0;
  carrinho.forEach((p, idx) => {
    total += p.preco;
    itemsDiv.innerHTML += `
      <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
        <span>${p.nome}</span>
        <span>R$ ${p.preco.toFixed(2)} <a href="#" onclick="removerDoCarrinho(${idx})" style="color:red;">X</a></span>
      </div>
    `;
  });
  document.getElementById("cart-total").textContent = total.toFixed(2);
}

window.removerDoCarrinho = (idx) => {
  carrinho.splice(idx, 1);
  atualizarCarrinhoUI();
};

window.abrirCarrinho = () => document.getElementById("modal-carrinho").classList.remove("hidden");
window.fecharCarrinho = () => document.getElementById("modal-carrinho").classList.add("hidden");

window.finalizarPedidoWhats = () => {
  if (carrinho.length === 0) return alert("Seu carrinho está vazio!");
  
  let texto = "Olá Rose! Gostaria de comprar os seguintes produtos do site:\n\n";
  let total = 0;
  carrinho.forEach(item => {
    texto += `- ${item.nome}: R$ ${item.preco.toFixed(2)}\n`;
    total += item.preco;
  });
  texto += `\n*Total: R$ ${total.toFixed(2)}*`;
  if (currentUser) texto += `\nCliente: ${currentUser.displayName}`;

  window.open(`https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(texto)}`, '_blank');
};
