/* ========= Page: Anime Detail ========= */
async function PageAnime({params}){
  const app = document.getElementById("app");
  app.innerHTML = LenzUI.skeletonDetail();
  try{
    const data = await LenzAPI.anime(params.slug);
    const a = data.data || data;
    const title = a.title || a.judul || params.slug;
    document.title = `${title} | LENZ ANIME NONTON`;

    // Episode list normalize
    const episodes = LenzAPI.extractList({data:a}, "episode_list","episodeList","episodes");
    const related  = LenzAPI.extractList({data:a}, "recommendations","related","recommendation");

    const poster = a.poster || a.thumbnail || a.thumb || a.image || LenzImg.PLACEHOLDER;
    const banner = a.cover || a.banner || poster;
    const genres = (a.genre_list || a.genres || a.genre || []).map(g=> typeof g==='string'?{name:g,slug:g.toLowerCase()}:g);
    const synopsis = a.synopsis || a.sinopsis || a.description || "-";

    
    // Favorites + recommendation safe render
    const slug = params.slug;
    const favState = window.LenzFavorites?.isFavorite(slug);
    const favoriteBtn = `<button id="favorite-btn" class="btn btn-ghost">${favState?'💔 Hapus dari Favorit':'❤️ Tambah ke Favorit'}</button>`;

    let recommendationHTML = '';
    try{
      const listData = await LenzAPI.home?.() || await LenzAPI.ongoing?.() || {};
      const pool = LenzAPI.extractList(listData,'animeList','data','results','ongoing','anime');
      const currentGenres = (genres||[]).map(g=>(g.name||g).toLowerCase());
      const studio = String(a.studio||'').toLowerCase();
      const recs = (pool||[]).filter(x=>{
        const n=LenzUI.normalize(x);
        if(!n.slug || n.slug===slug) return false;
        const gs=((x.genre_list||x.genres||[]).map(g=>(g.name||g).toLowerCase()));
        const sameGenre=gs.some(g=>currentGenres.includes(g));
        const sameStudio=String(x.studio||'').toLowerCase()===studio && studio;
        return sameGenre || sameStudio;
      }).slice(0,10);
      if(recs.length){
        recommendationHTML = LenzUI.sectionHTML('Rekomendasi Untuk Kamu',LenzUI.gridHTML(recs));
      }
    }catch(e){}

app.innerHTML = `
      <div class="detail-banner"><img src="${banner}" alt="" onerror="this.src='${LenzImg.PLACEHOLDER}'"></div>
      <div class="detail-head">
        <div class="detail-poster"><img src="${poster}" alt="${LenzUI.escapeHTML(title)}" onerror="this.src='${LenzImg.PLACEHOLDER}'"></div>
        <div class="detail-info">
          <h1>${LenzUI.escapeHTML(title)}</h1>
          <div class="jp">${LenzUI.escapeHTML(a.japanese_title||a.judul_jepang||"")}</div>
          <div class="detail-genres">${genres.map(g=>`<a class="chip" href="#/genre/${encodeURIComponent(g.slug||g.name)}">${LenzUI.escapeHTML(g.name||g)}</a>`).join("")}</div>
          <div class="detail-meta">
            <div><strong>Skor</strong>${LenzUI.escapeHTML(a.score||a.rating||"-")}</div>
            <div><strong>Status</strong>${LenzUI.escapeHTML(a.status||"-")}</div>
            <div><strong>Tipe</strong>${LenzUI.escapeHTML(a.type||"-")}</div>
            <div><strong>Studio</strong>${LenzUI.escapeHTML(a.studio||"-")}</div>
            <div><strong>Producer</strong>${LenzUI.escapeHTML(a.producer||a.producers||"-")}</div>
            <div><strong>Season</strong>${LenzUI.escapeHTML(a.season||"-")}</div>
            <div><strong>Rilis</strong>${LenzUI.escapeHTML(a.release_date||a.released_on||"-")}</div>
            <div><strong>Durasi</strong>${LenzUI.escapeHTML(a.duration||"-")}</div>
            <div><strong>Episode</strong>${LenzUI.escapeHTML(a.total_episode||episodes.length||"-")}</div>
          </div>
          <div class="detail-actions">\n${favoriteBtn}
            ${episodes[0] ? `<a class="btn btn-primary" href="#/episode/${encodeURIComponent(episodes[0].slug||episodes[0].endpoint||'')}">▶ Tonton Sekarang</a>` : ""}
            <a class="btn btn-ghost" href="#/batch/${encodeURIComponent(params.slug)}">⬇ Batch Download</a>
          </div>
        </div>
      </div>

      <section class="detail-synopsis">
        <h2>Sinopsis</h2>
        <p>${LenzUI.escapeHTML(synopsis)}</p>
      </section>

      <section class="section">
        <div class="section-head"><h2>Daftar Episode</h2></div>
        <div class="episode-list">
          ${episodes.length ? episodes.map(ep=>{
            const s = ep.slug||ep.endpoint||"";
            const n = ep.episode||ep.title||ep.number||s;
            return `<a href="#/episode/${encodeURIComponent(s)}">Episode ${LenzUI.escapeHTML(String(n))}</a>`;
          }).join("") : `<div style="color:var(--muted);padding:14px">Belum ada episode.</div>`}
        </div>
      </section>

      ${related.length ? LenzUI.sectionHTML("Anime Terkait", LenzUI.gridHTML(related)) : ""}\n${recommendationHTML}
    `;

    LenzImg.scan(app);
    LenzUI.upgradePosters(app);

    // Upgrade poster utama via Jikan
    const mainPoster = app.querySelector(".detail-poster img");
    LenzImg.upgradePoster(mainPoster, title, poster);
    const bannerImg = app.querySelector(".detail-banner img");
    LenzImg.upgradePoster(bannerImg, title, banner);
    const favBtn=document.getElementById('favorite-btn');
    if(favBtn){
      favBtn.onclick=()=>{
        const state=LenzFavorites.toggle({slug,title,poster});
        favBtn.textContent=state?'💔 Hapus dari Favorit':'❤️ Tambah ke Favorit';
      }
    }
  }catch(err){ LenzError.show(err); }
}
