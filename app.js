import { MENU } from './menu.js';

const menuEl      = document.getElementById('menu');
const tableSelect = document.getElementById('tableSelect');
const cartDialog  = document.getElementById('cartDialog');
const cartItemsEl = document.getElementById('cartItems');
const cartTotalEl = document.getElementById('cartTotal');
const cartTableEl = document.getElementById('cartTable');
const cartCountEl = document.getElementById('cartCount');

let cart = {};

// --- Tische 1‑50
for(let i=1;i<=50;i++){
  const opt=document.createElement('option');
  opt.value=i; opt.textContent=`Tisch ${i}`;
  tableSelect.appendChild(opt);
}

// --- Menü aufbauen
MENU.forEach((item, idx) => {
  const card=document.createElement('div');
  card.className='card';
  card.innerHTML=`<strong>${item.name}</strong><br>€${item.price.toFixed(2)}`;
  card.onclick=()=>{ addToCart(idx); };
  menuEl.appendChild(card);
});

function addToCart(idx){
  cart[idx]=(cart[idx]||0)+1;
  updateCartCount();
}

function updateCartCount(){
  const cnt=Object.values(cart).reduce((a,b)=>a+b,0);
  cartCountEl.textContent=cnt;
}

// --- Öffnet Warenkorb
openCart.onclick=()=>{
  if(!tableSelect.value) return alert('Bitte Tisch wählen');
  renderCart();
  cartTableEl.textContent=tableSelect.value;
  cartDialog.showModal();
};
closeCart.onclick=()=>cartDialog.close();

function renderCart(){
  cartItemsEl.innerHTML='';
  let sum=0;
  Object.entries(cart).forEach(([idx, qty])=>{
    const item=MENU[idx];
    const li=document.createElement('li');
    li.className='cart-row';
    li.innerHTML=`${qty} × ${item.name}<span>€${(item.price*qty).toFixed(2)}</span>`;
    cartItemsEl.appendChild(li);
    sum+=item.price*qty;
  });
  cartTotalEl.textContent=sum.toFixed(2);
}

// --- Bestellung senden
sendOrder.onclick=()=>{
  if(Object.keys(cart).length===0) return alert('Warenkorb leer');
  const orders=JSON.parse(localStorage.getItem('orders')||'[]');
  orders.push({ id:Date.now(), table:tableSelect.value, items:cart, time:new Date().toLocaleTimeString() });
  localStorage.setItem('orders',JSON.stringify(orders));
  broadcast();
  cart={}; updateCartCount(); cartDialog.close(); alert('Bestellung gesendet');
};

// --- Broadcast an Küche
const bc=new BroadcastChannel('orders');
function broadcast(){ bc.postMessage('update'); }
