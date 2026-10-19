import { db } from './firebase.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

async function carregarProdutosLoja() {
  const container = document.getElementById('grid-produtos');
  if (!container) return;

  try {
    const querySnapshot = await getDocs(collection(db, "produtos"));
    container.innerHTML = "";

    if (querySnapshot.empty) {
      container.innerHTML = "<p style='color: var(--text-muted); grid-column: 1/-1; text-align: center;'>Nenhum produto cadastrado no momento.</p>";
      return;
    }

    querySnapshot.forEach((documento) => {
      const p = documento.data();
      const card = document.createElement('div');
      card.style.cssText = "background: white; border-radius: 16px; padding: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); display: flex; flex-direction: column; justify-content: space-between;";

      card.innerHTML = `
        <div>
          <img src="${p.imagem}" alt="${p.nome}" style="width: 100%; height: 160px; object-fit: cover; border-radius: 12px; margin-bottom: 10px;">
          <h3 style="font-size: 1rem; color: var(--text-dark); margin-bottom: 5px;">${p.nome}</h3>
          <p style="font-size: 1.1rem; font-weight: 700; color: var(--primary); margin-bottom: 10px;">R$ ${Number(p.preco).toFixed(2)}</p>
        </div>
        <button style="width: 100%; background: var(--primary); color: white; border: none; padding: 10px; border-radius: 10px; font-weight: 600; cursor: pointer;">Reservar</button>
      `;
      container.appendChild(card);
    });
  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
    container.innerHTML = "<p style='color: red; grid-column: 1/-1;'>Erro ao carregar os produtos.</p>";
  }
}

// Carrega os produtos assim que a página abre
document.addEventListener('DOMContentLoaded', carregarProdutosLoja);
