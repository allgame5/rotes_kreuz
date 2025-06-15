import { auth, db } from "./firebase-config.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import {
  collection, doc, getDocs, addDoc, serverTimestamp, updateDoc, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const menuEl   = document.getElementById('menu');
const cartEl   = document.getElementById('cart');
const sendBtn  = document.getElementById('send');
const tableSel = document.getElementById('tableSelect');
const roomLbl  = document.getElementById('roomLabel');
const logout   = document.getElementById('logout');

let cart = {};
let rooms = [];

// --- 1. Räume + Tische laden
(async function initTables() {
  const q = await getDocs(collection(db, 'rooms'));
  rooms = q.docs.map(d => d.data());
  rooms.forEach((r, idx) => {
    if (idx === 0) roomLbl.textContent = r.name;
    r.tables.forEach(t => {
      const opt = document.createElement('option');
      opt.value = `${r.name}|${t}`;
      opt.textContent = `${r.name} – Tisch ${t}`;
      tableSel.appendChild(opt);
    });
  });
})();

// --- 2. Speisekarte laden & Lagerbestand live überwachen
onSnapshot(collection(db, 'menu'), snap => {
  menuEl.innerHTML = '';
  snap.forEach(docSnap => {
    const item = docSnap.data();
    const card = document.createElement('div');
    card.className = 'card' + (item.outOfStock ? ' out' : '');
    card.innerHTML = `<strong>${item.name}</strong><br>€${item.price.toFixed(2)}`;
    card.onclick = () => {
      if (item.outOfStock) return;
      cart[item.name] = (cart[item.name] || 0) + 1;
      renderCart();
    };
    menuEl.appendChild(card);
  });
});

function renderCart() {
  cartEl.innerHTML = '';
  Object.entries(cart).forEach(([name, qty]) => {
    const li = document.createElement('li');
    li.className = 'order-item';
    li.innerHTML = `${qty} × ${name} <button data-name="${name}">–</button>`;
    li.querySelector('button').onclick = e => {
      const n = e.target.dataset.name;
      cart[n]--;
      if (cart[n] <= 0) delete cart[n];
      renderCart();
    };
    cartEl.appendChild(li);
  });
}

sendBtn.onclick = async () => {
  if (!tableSel.value) return alert('Tisch wählen');
  if (Object.keys(cart).length === 0) return alert('Keine Artikel');
  await addDoc(collection(db, 'orders'), {
    table: tableSel.value,
    items: cart,
    status: 'offen',
    createdAt: serverTimestamp()
  });
  cart = {};
  renderCart();
  alert('Bestellung gesendet!');
};

logout.onclick = () => signOut(auth).then(() => location.href = '/');
