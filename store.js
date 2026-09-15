const SUPABASE_URL='https://ridzsxntmtpbbcbqbrlz.supabase.co';
const SUPABASE_ANON_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpZHpzeG50bXRwYmJjYnFicmx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0MTc5NzAsImV4cCI6MjEwNDk5Mzk3MH0.zm0CS3vfw05k9VVm9kOheaBN5Rou6HcGDFNYmfd2wYU';
const sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY);
const CART_KEY='everydays_class_cart_v1',ADMIN_KEY='everydays_class_admin_session_v1';

const FALLBACK_IMAGES={'wash-1':'/assets/feminelle.jpg','dress-1':'/assets/dress.jpg','heels-1':'/assets/heels.jpg'};
const mapProduct=r=>{if(!r)return null;let image=r.image_url;if(!image||image.startsWith('PLACEHOLDER'))image=FALLBACK_IMAGES[r.id]||image;return{id:r.id,name:r.name,category:r.category,price:r.price,description:r.description,image}};
const mapOrder=r=>r?{id:r.id,createdAt:r.created_at,customer:r.customer,fulfilment:r.fulfilment,items:r.items,subtotal:r.subtotal,charges:r.charges,delivery:r.delivery,total:r.total,status:r.status,receipt:r.receipt_url}:null;

async function uploadImage(bucket,file,prefix){
  const ext=(file.name.split('.').pop()||'jpg').toLowerCase();
  const path=`${prefix}-${Date.now()}.${ext}`;
  const{error}=await sb.storage.from(bucket).upload(path,file,{upsert:true});
  if(error){console.error(error);return null}
  return sb.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

async function getProducts(){const{data,error}=await sb.from('products').select('*').order('created_at');if(error){console.error(error);return[]}return data.map(mapProduct)}
async function getProduct(id){if(!id)return null;const{data,error}=await sb.from('products').select('*').eq('id',id).maybeSingle();if(error){console.error(error);return null}return mapProduct(data)}
async function saveProduct(p,file){
  let image=p.image;
  const id=p.id||('product-'+Date.now());
  if(file){const url=await uploadImage('product-images',file,id);if(url)image=url}
  const{error}=await sb.from('products').upsert({id,name:p.name,category:p.category,price:p.price,description:p.description,image_url:image});
  if(error){console.error(error);return null}
  return id;
}
async function deleteProduct(id){const{error}=await sb.from('products').delete().eq('id',id);if(error)console.error(error)}

function getCart(){return JSON.parse(localStorage.getItem(CART_KEY)||'[]')}
function setCart(c){localStorage.setItem(CART_KEY,JSON.stringify(c))}
function addToCart(id,qty=1){const c=getCart(),x=c.find(i=>i.id===id);x?x.qty+=qty:c.push({id,qty});setCart(c)}
function updateCart(id,qty){setCart(getCart().map(x=>x.id===id?{...x,qty}:x).filter(x=>x.qty>0))}
async function cartItems(){
  const c=getCart();
  const items=await Promise.all(c.map(async x=>{const p=await getProduct(x.id);return p?{...p,qty:x.qty,line:p.price*x.qty}:null}));
  return items.filter(Boolean);
}
async function cartSubtotal(){return(await cartItems()).reduce((s,x)=>s+x.line,0)}
function clearCart(){localStorage.removeItem(CART_KEY)}

async function createOrder(customer,fulfilment){
  const items=await cartItems();
  const subtotal=items.reduce((s,x)=>s+x.line,0);
  const delivery=fulfilment==='delivery'?1500:0;
  const row={id:'EC-'+String(Date.now()).slice(-6),customer,fulfilment,items:items.map(({id,name,price,qty,line})=>({id,name,price,qty,line})),subtotal,charges:100,delivery,total:subtotal+100+delivery,status:'Pending'};
  const{data,error}=await sb.from('orders').insert(row).select().single();
  if(error){console.error(error);return null}
  clearCart();
  return mapOrder(data);
}
async function getOrders(){const{data,error}=await sb.from('orders').select('*').order('created_at',{ascending:false});if(error){console.error(error);return[]}return data.map(mapOrder)}
async function getOrder(id){if(!id)return null;const{data,error}=await sb.from('orders').select('*').eq('id',id).maybeSingle();if(error){console.error(error);return null}return mapOrder(data)}
async function updateOrder(id,patch,receiptFile){
  const update={};
  if(patch&&patch.status)update.status=patch.status;
  if(receiptFile){const url=await uploadImage('receipts',receiptFile,id);if(url)update.receipt_url=url}
  const{data,error}=await sb.from('orders').update(update).eq('id',id).select().single();
  if(error){console.error(error);return null}
  return mapOrder(data);
}

const formatNaira=n=>'₦'+Number(n||0).toLocaleString('en-NG');
const cartCount=()=>getCart().reduce((s,x)=>s+x.qty,0);
const isAdmin=()=>localStorage.getItem(ADMIN_KEY)==='1';
const setAdminSession=v=>localStorage.setItem(ADMIN_KEY,v?'1':'0');
const logoutAdmin=()=>localStorage.removeItem(ADMIN_KEY);

window.Store={getProducts,getProduct,saveProduct,deleteProduct,getCart,setCart,addToCart,updateCart,cartItems,cartSubtotal,clearCart,createOrder,getOrders,getOrder,updateOrder,formatNaira,cartCount,isAdmin,setAdminSession,logoutAdmin};
