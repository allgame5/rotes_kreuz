import { MENU } from './menu.js';
const ordersEl=document.getElementById('orders');
const bc=new BroadcastChannel('orders');

function loadOrders(){
  const orders=JSON.parse(localStorage.getItem('orders')||'[]');
  ordersEl.innerHTML='';
  orders.forEach(o=>{
    const div=document.createElement('div');
    div.className='kitchen-order';
    div.innerHTML=`<h3>Tisch ${o.table} – ${o.time}</h3><ul>`+
      Object.entries(o.items).map(([idx,qty])=>`<li>${qty} × ${MENU[idx].name}</li>`).join('')+
      `</ul><button data-id="${o.id}">Erledigt</button>`;
    div.querySelector('button').onclick=markDone;
    ordersEl.appendChild(div);
  });
}

function markDone(e){
  const id=parseInt(e.target.dataset.id,10);
  let orders=JSON.parse(localStorage.getItem('orders')||'[]');
  orders=orders.filter(o=>o.id!==id);
  localStorage.setItem('orders',JSON.stringify(orders));
  loadOrders(); bc.postMessage('update');
}

bc.onmessage=()=>loadOrders();
window.addEventListener('storage',loadOrders);
loadOrders();
