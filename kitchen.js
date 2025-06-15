import { MENU } from './menu.js';

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, collection, query, orderBy, onSnapshot, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// Firebase Config – bitte mit deinen Daten ersetzen:
const firebaseConfig = {
  apiKey: "AIzaSyAhj_c8zrE36vIJhdKfaqJ1q4eHAtE988k",
  authDomain: "rotes-kreuz-55946.firebaseapp.com",
  projectId: "rotes-kreuz-55946",
  storageBucket: "rotes-kreuz-55946.firebasestorage.app",
  messagingSenderId: "598428252142",
  appId: "1:598428252142:web:db2d1d23547b3de83240ff",
  measurementId: "G-REMTQ0EDZP"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ordersEl = document.getElementById('orders');
const bc = new BroadcastChannel('orders');

function renderOrders(orders) {
  ordersEl.innerHTML = '';
  orders.forEach(({ id, table, items, createdAt }) => {
    const div = document.createElement('div');
    div.className = 'kitchen-order';
    div.dataset.id = id;

    const time = createdAt?.toDate?.()?.toLocaleTimeString() || '';

    div.innerHTML = `<h3>Tisch ${table} – ${time}</h3><ul>` +
      Object.entries(items).map(([idx, qty]) => `<li>${qty} × ${MENU[idx].name}</li>`).join('') +
      `</ul><button data-id="${id}">Erledigt</button>`;

    div.querySelector('button').onclick = () => markDoneFirebase(id);
    ordersEl.appendChild(div);
  });
}

function loadOrdersFromFirebase() {
  const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));

  onSnapshot(q, (querySnapshot) => {
    const orders = [];
    querySnapshot.forEach(docSnap => {
      orders.push({ id: docSnap.id, ...docSnap.data() });
    });
    renderOrders(orders);
  });
}

async function markDoneFirebase(id) {
  try {
    await deleteDoc(doc(db, 'orders', id));
    bc.postMessage('update');
  } catch (e) {
    console.error('Fehler beim Löschen:', e);
  }
}

bc.onmessage = () => {
  // Firestore onSnapshot sorgt für Live-Updates, hier nichts nötig
};

loadOrdersFromFirebase();
