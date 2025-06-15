import { db } from "./firebase-config.js";
import {
  collection, onSnapshot, updateDoc, doc, deleteDoc
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const ordersEl = document.getElementById('orders');

onSnapshot(collection(db, 'orders'), snap => {
  ordersEl.innerHTML = '';
  snap.forEach(docSnap => {
    const o = docSnap.data();
    const div = document.createElement('div');
    div.className = 'kitchen-order';
    div.innerHTML = `<h3>${o.table}</h3><ul>` +
      Object.entries(o.items).map(([n,q]) => `<li>${q} × ${n}</li>`).join('') +
      `</ul><button>Erledigt</button>`;
    div.querySelector('button').onclick = () => deleteDoc(doc(db,'orders',docSnap.id));
    ordersEl.appendChild(div);
  });
});
