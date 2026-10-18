import { 
  auth, db, signInWithEmailAndPassword, collection, doc, 
  addDoc, updateDoc, deleteDoc, setDoc, onSnapshot 
} from "./firebase.js";

const loginBox = document.getElementById("admin-login-box");
const panel = document.getElementById("admin-panel");
const formLogin = document.getElementById("form-login-admin");
const formProduto = document.getElementById("form-produto");

formLogin.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("admin-email").value;
  const senha = document.getElementById("admin-senha").value;

  try {
    await signInWithEmailAndPassword(auth, email, senha);
    loginBox.classList.add("hidden");
    panel.classList.remove("hidden");
    carregarAdminProdutos();
  } catch (err) {
    alert("Dados inválidos de administrador.");
  }
});

formProduto.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("prod-id").value;
  const nome = document.getElementById("prod-nome").value;
  const preco = parseFloat(document.getElementById("prod-preco").value);
  const imagem = document.getElementById("prod-imagem").value;

  try {
    if (id) {
      await updateDoc(doc(db, "produtos", id), { nome, preco, imagem });
      alert("Produto atualizado!");
    } else {
      await addDoc(collection(db, "produtos"), {
        nome, preco, imagem, criadoEm: new Date()
      });
      alert("Produto criado!");
    }
    limparFormulario();
  } catch (err) {
    alert("Erro ao salvar produto.");
  }
});

function carregarAdminProdutos() {
  onSnapshot(collection(db, "produtos"), (snapshot) => {
    const listDiv = document.getElementById("admin-produtos-list");
    listDiv.innerHTML = "";

    snapshot.forEach(docSnap => {
      const p = { id: docSnap.id, ...docSnap.data() };
      const statusReserva = p.reserva ? `Reservado para: ${p.reserva.userName}` : 'Livre';

      const row = document.createElement("div");
      row.style = "display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #ccc; padding: 10px 0;";
      row.innerHTML = `
        <div>
          <strong>${p.nome}</strong> - R$ ${p.preco.toFixed(2)}<br>
          <small style="color: #666;">Status: ${statusReserva}</small>
        </div>
        <div style="display: flex; gap: 5px;">
          <button class="btn btn-rosa" onclick="prepararEdicao('${p.id}', '${p.nome}', ${p.preco}, '${p.imagem}')">Editar</button>
          ${p.reserva ? `<button class="btn btn-reserva" onclick="removerReserva('${p.id}')">Tirar Reserva</button>` : ''}
          <button class="btn btn-danger" onclick="excluirProduto('${p.id}')">Remover</button>
        </div>
      `;
      listDiv.appendChild(row);
    });
  });
}

window.prepararEdicao = (id, nome, preco, imagem) => {
  document.getElementById("prod-id").value = id;
  document.getElementById("prod-nome").value = nome;
  document.getElementById("prod-preco").value = preco;
  document.getElementById("prod-imagem").value = imagem;
  document.getElementById("form-title").textContent = "Editar Produto";
  document.getElementById("btn-cancelar").classList.remove("hidden");
};

window.limparFormulario = () => {
  document.getElementById("prod-id").value = "";
  formProduto.reset();
  document.getElementById("form-title").textContent = "Cadastrar Produto";
  document.getElementById("btn-cancelar").classList.add("hidden");
};

window.excluirProduto = async (id) => {
  if (confirm("Deseja realmente apagar este produto?")) {
    await deleteDoc(doc(db, "produtos", id));
  }
};

window.removerReserva = async (id) => {
  if (confirm("Deseja liberar este produto da reserva?")) {
    await updateDoc(doc(db, "produtos", id), { reserva: null });
  }
};

window.banirUsuario = async () => {
  const uid = document.getElementById("ban-uid").value.trim();
  if (!uid) return alert("Digite o UID do usuário!");

  try {
    await setDoc(doc(db, "banidos", uid), {
      banidoEm: new Date(),
      motivo: "Violação de regras"
    });
    alert("Usuário banido com sucesso!");
    document.getElementById("ban-uid").value = "";
  } catch (err) {
    alert("Erro ao banir usuário.");
  }
};
