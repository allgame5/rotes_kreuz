import { MENU } from './menu.js';

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// --- Firebase Config (deine Daten einfügen)
const firebaseConfig = {
  apiKey: "AIzaSyAhj_c8zrE36vIJhdKfaqJ1q4eHAtE988k",
  authDomain: "rotes-kreuz-55946.firebaseapp.com",
  projectId: "rotes-kreuz-55946",
  storageBucket: "rotes-kreuz-55946.firebasestorage.app",
  messagingSenderId: "598428252142",
  appId: "1:598428252142:web:db2d1d23547b3de83240ff",
  measurementId: "G-REMTQ0EDZP"
};

// Firebase initialisieren
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// --- DOM Elemente
const menuEl      = document.getElementById('menu');
const tableSelect = document.getElementById('tableSelect');
const cartDialog  = document.getElementById('cartDialog');
const cartItemsEl = document.getElementById('cartItems');
const cartTotalEl = document.getElementById('cartTotal');
const cartTableEl = document.getElementById('cartTable');
const cartCountEl = document.getElementById('cartCount');


// Warenkorb Objekt
let cart = {};


// --- Tische 1‑50 in Auswahl einfügen
for(let i = 1; i <= 50; i++) {
  const opt = document.createElement('option');
  opt.value = i;
  opt.textContent = `Tisch ${i}`;
  tableSelect.appendChild(opt);
}


// --- Menükarte bauen
MENU.forEach((item, idx) => {
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `<strong>${item.name}</strong><br>€${item.price.toFixed(2)}`;
  card.onclick = () => addToCart(idx);
  menuEl.appendChild(card);
});


// --- Artikel in Warenkorb hinzufügen
function addToCart(idx) {
  cart[idx] = (cart[idx] || 0) + 1;
  updateCartCount();
}


// --- Anzahl im Warenkorb aktualisieren
function updateCartCount() {
  const count = Object.values(cart).reduce((a, b) => a + b, 0);
  cartCountEl.textContent = count;
}


// --- Warenkorb anzeigen
document.getElementById('openCart').onclick = () => {
  if (!tableSelect.value) {
    alert('Bitte Tisch wählen');
    return;
  }
  renderCart();
  cartTableEl.textContent = tableSelect.value;
  cartDialog.showModal();
};

// Warenkorb schließen
document.getElementById('closeCart').onclick = () => cartDialog.close();


// --- Warenkorb rendern (Artikel + Summe)
function renderCart() {
  cartItemsEl.innerHTML = '';
  let sum = 0;

  Object.entries(cart).forEach(([idx, qty]) => {
    const item = MENU[idx];
    const li = document.createElement('li');
    li.className = 'cart-row';
    li.innerHTML = `${qty} × ${item.name}<span>€${(item.price * qty).toFixed(2)}</span>`;
    cartItemsEl.appendChild(li);
    sum += item.price * qty;
  });

  cartTotalEl.textContent = sum.toFixed(2);
}


// --- Bestellung senden (nur Firebase, kein localStorage)
document.getElementById('sendOrder').onclick = async () => {
  if (Object.keys(cart).length === 0) {
    alert('Warenkorb leer');
    return;
  }

  if (!tableSelect.value) {
    alert('Bitte Tisch wählen');
    return;
  }

  try {
    await addDoc(collection(db, 'orders'), {
      table: tableSelect.value,
      items: cart,
      createdAt: serverTimestamp()
    });

    broadcast();

    cart = {};
    updateCartCount();
    cartDialog.close();

    alert('Bestellung gesendet');
  } catch (e) {
    console.error('Fehler beim Senden der Bestellung:', e);
    alert('Bestellung konnte nicht gesendet werden');
  }
};


// --- Broadcast an Küche (für Updates)
const bc = new BroadcastChannel('orders');

function broadcast() {
  bc.postMessage('update');
}
