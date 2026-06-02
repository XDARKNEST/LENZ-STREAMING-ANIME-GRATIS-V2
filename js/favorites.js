
(function(){
const KEY='lenz_favorites_v1';
function getAll(){
 try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch(e){return []}
}
function save(items){ localStorage.setItem(KEY, JSON.stringify(items||[]));}
function isFavorite(slug){
 return !!slug && getAll().some(x=>x.slug===slug);
}
function toggle(anime){
 if(!anime?.slug) return false;
 const items=getAll();
 const idx=items.findIndex(x=>x.slug===anime.slug);
 if(idx>=0){ items.splice(idx,1); save(items); return false; }
 items.unshift({
   slug: anime.slug,
   title: anime.title || anime.judul || anime.slug,
   poster: anime.poster || anime.thumbnail || anime.thumb || anime.image || ''
 });
 save(items); return true;
}
async function PageFavorites(){
 const app=document.getElementById('app');
 const items=getAll();
 app.innerHTML=`<section class="section"><div class="section-head"><h2>Anime Favorit Saya</h2></div>${
 items.length ? LenzUI.gridHTML(items) :
 '<div class="state"><div class="emoji">❤️</div><h3>Belum ada favorit</h3></div>'
 }</section>`;
 LenzImg.scan(app);
}
window.LenzFavorites={getAll,isFavorite,toggle,PageFavorites};
})();
