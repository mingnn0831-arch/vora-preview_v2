// listings-app.jsx — VORA 중고차 검색/매물 화면

const { useState, useMemo, useEffect, useRef } = React;

/* ─────── DATA ─────── */
const BRANDS = [
  { k: 'hyundai',  name: '현대',       count: 1280 },
  { k: 'kia',      name: '기아',       count: 980  },
  { k: 'toyota',   name: 'Toyota',    count: 1542 },
  { k: 'honda',    name: 'Honda',     count: 892  },
  { k: 'mazda',    name: 'Mazda',     count: 412  },
  { k: 'ford',     name: 'Ford',      count: 384  },
  { k: 'vinfast',  name: 'VinFast',   count: 622  },
  { k: 'nissan',   name: 'Nissan',    count: 196  },
  { k: 'bmw',      name: 'BMW',       count: 142  },
  { k: 'mercedes', name: 'Mercedes',  count: 168  },
];

const BODIES = ['세단', 'SUV', '해치백', '미니밴', '트럭', '쿠페'];
const FUELS  = [
  { k: '가솔린', count: 2890 },
  { k: '디젤',   count: 1820 },
  { k: '하이브리드', count: 410 },
  { k: '전기',   count: 198 },
  { k: 'LPG',    count: 102 },
];
const TRANS  = ['자동', '수동'];
const REGIONS = ['하노이', '호치민', '다낭', '하이퐁', '껀터', '냐짱'];
const COLORS = [
  { k: 'white',  hex: '#FFFFFF', name: '화이트', ring: true },
  { k: 'black',  hex: '#000919', name: '블랙' },
  { k: 'silver', hex: '#C8CDD3', name: '실버' },
  { k: 'gray',   hex: '#5B6A7D', name: '그레이' },
  { k: 'red',    hex: '#D9384B', name: '레드' },
  { k: 'blue',   hex: '#2276DB', name: '블루' },
  { k: 'beige',  hex: '#E2D4B7', name: '베이지' },
  { k: 'brown',  hex: '#6B4A2B', name: '브라운' },
];

const SORTS = [
  { k: 'recommended', label: '추천순' },
  { k: 'new',        label: '최신순' },
  { k: 'price_low',  label: '낮은 가격순' },
  { k: 'price_high', label: '높은 가격순' },
  { k: 'mileage',    label: '주행거리순' },
  { k: 'year_new',   label: '연식 최신순' },
];

const BADGE_VARIANTS = ['brand', 'new', 'hot', 'cert'];
const TRIMS = [
  '2.2 디젤 프레스티지', '1.5G CVT Premium', '3세대 시그니처', '2.0 LPG 인스퍼레이션',
  '하이브리드 X-Line', 'RS Top Edition', '디젤 4WD Signature', '1.6 가솔린 노블레스',
  '2.0 터보 GT-Line', 'EV Plus Long Range', '4세대 익스클루시브', '1.8 하이브리드 S',
];
const NAMES = [
  ['2022 현대 팰리세이드', 'hyundai', 'SUV'],
  ['2023 Toyota Vios', 'toyota', '세단'],
  ['2021 기아 쏘렌토', 'kia', 'SUV'],
  ['2022 Honda City', 'honda', '세단'],
  ['2023 VinFast VF8', 'vinfast', 'SUV'],
  ['2020 Mazda CX-5', 'mazda', 'SUV'],
  ['2023 현대 투싼', 'hyundai', 'SUV'],
  ['2022 기아 K5', 'kia', '세단'],
  ['2021 Honda CR-V', 'honda', 'SUV'],
  ['2024 Toyota Camry', 'toyota', '세단'],
  ['2022 Ford Ranger', 'ford', '트럭'],
  ['2023 Mercedes C200', 'mercedes', '세단'],
  ['2023 현대 싼타페', 'hyundai', 'SUV'],
  ['2022 BMW 320i', 'bmw', '세단'],
  ['2024 VinFast VF6', 'vinfast', 'SUV'],
  ['2023 Toyota Innova', 'toyota', '미니밴'],
];

function makeListings() {
  // Deterministic generation for stable list
  return NAMES.flatMap((spec, i) => {
    const [name, brand, body] = spec;
    return [0,1].map(k => {
      const idx = i*2 + k;
      const year = 2019 + (idx % 6);
      const km = 8000 + (idx * 4200) % 90000;
      const price = 380 + ((idx * 173) % 1400);
      const fuel = ['디젤','가솔린','하이브리드','전기'][idx % 4];
      const region = REGIONS[idx % REGIONS.length];
      const trim = TRIMS[idx % TRIMS.length];
      const badge = BADGE_VARIANTS[idx % BADGE_VARIANTS.length];
      const rise = ((idx * 11) % 30) / 10 + 0.3;
      const cert = idx % 3 === 0;
      return {
        id: 'V' + (1000 + idx),
        name, brand, body, year, km, price, fuel, region, trim, badge, rise, cert,
      };
    });
  });
}
const LISTINGS = makeListings();

/* ─────── ICONS ─────── */
const Ic = ({ name, w=16, h=16, ...rest }) =>
  <svg width={w} height={h} {...rest}><use href={'#i-' + name}/></svg>;

const BadgeLabel = {
  brand: { cls: 'badge--brand', label: 'VORA 인증' },
  new:   { cls: 'badge--new',   label: '신규' },
  hot:   { cls: 'badge--hot',   label: '인기' },
  cert:  { cls: 'badge--cert',  label: '365 검수' },
};

/* ─────── FILTER PRIMITIVES ─────── */
function Filter({ title, defaultOpen=true, action, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="filter" data-open={open}>
      <div className="filter__head" onClick={() => setOpen(o => !o)}>
        <h4>{title}</h4>
        <div style={{display:'flex', alignItems:'center', gap:6}}>
          {action}
          <svg className="chev"><use href="#i-chevron"/></svg>
        </div>
      </div>
      <div className="filter__body">{children}</div>
    </div>
  );
}

function Check({ checked, onChange, label, count }) {
  return (
    <label className="check">
      <input type="checkbox" checked={checked} onChange={onChange}/>
      <span className="check__box"/>
      <span>{label}</span>
      {count != null && <span className="check__count">{count.toLocaleString()}</span>}
    </label>
  );
}

function Range({ value, onChange, min, max, step=1, format }) {
  // value = [lo, hi]
  const [lo, hi] = value;
  const trackRef = useRef(null);
  const dragging = useRef(null);

  function pct(v) { return ((v - min) / (max - min)) * 100; }

  function start(side, e) {
    e.preventDefault();
    dragging.current = side;
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', end);
  }
  function move(e) {
    const t = trackRef.current; if (!t) return;
    const rect = t.getBoundingClientRect();
    let p = (e.clientX - rect.left) / rect.width;
    p = Math.max(0, Math.min(1, p));
    let v = min + p * (max - min);
    v = Math.round(v / step) * step;
    if (dragging.current === 'lo') onChange([Math.min(v, hi - step), hi]);
    else                            onChange([lo, Math.max(v, lo + step)]);
  }
  function end() {
    dragging.current = null;
    document.removeEventListener('mousemove', move);
    document.removeEventListener('mouseup', end);
  }

  return (
    <div className="range">
      <div className="range__inputs">
        <label className="input"><input type="text" value={format ? format(lo) : lo} readOnly/></label>
        <span className="dash">~</span>
        <label className="input"><input type="text" value={format ? format(hi) : hi} readOnly/></label>
      </div>
      <div className="range__track" ref={trackRef}>
        <div className="range__fill" style={{ left: pct(lo) + '%', width: (pct(hi) - pct(lo)) + '%' }}/>
        <div className="range__thumb" style={{ left: pct(lo) + '%' }} onMouseDown={(e) => start('lo', e)}/>
        <div className="range__thumb" style={{ left: pct(hi) + '%' }} onMouseDown={(e) => start('hi', e)}/>
      </div>
      <div className="range__legend">
        <span>{format ? format(min) : min}</span>
        <span>{format ? format(max) : max}</span>
      </div>
    </div>
  );
}

/* ─────── MAIN APP ─────── */
function ListingsApp() {
  const [selBrands, setSelBrands] = useState(['hyundai', 'kia']);
  const [selBody, setSelBody]     = useState([]);
  const [selFuel, setSelFuel]     = useState(['디젤']);
  const [selTrans, setSelTrans]   = useState([]);
  const [selRegion, setSelRegion] = useState([]);
  const [selColor, setSelColor]   = useState([]);
  const [price, setPrice]   = useState([300, 1800]);   // 백만 đ
  const [year, setYear]     = useState([2019, 2024]);
  const [km, setKm]         = useState([0, 100000]);
  const [showCertOnly, setShowCertOnly] = useState(false);

  const [sort, setSort]     = useState('recommended');
  const [view, setView]     = useState('grid');
  const [page, setPage]     = useState(1);
  const [sortOpen, setSortOpen] = useState(false);
  const [liked, setLiked] = useState({});

  const sortRef = useRef(null);
  useEffect(() => {
    function onClick(e) {
      if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const toggleIn = (arr, set) => (k) => set(arr.includes(k) ? arr.filter(x => x !== k) : [...arr, k]);

  function resetAll() {
    setSelBrands([]); setSelBody([]); setSelFuel([]); setSelTrans([]);
    setSelRegion([]); setSelColor([]); setPrice([300,1800]); setYear([2019,2024]);
    setKm([0,100000]); setShowCertOnly(false);
  }

  // Filter + sort
  const filtered = useMemo(() => {
    let arr = LISTINGS.filter(L => {
      if (selBrands.length && !selBrands.includes(L.brand)) return false;
      if (selBody.length && !selBody.includes(L.body)) return false;
      if (selFuel.length && !selFuel.includes(L.fuel)) return false;
      if (L.price < price[0] || L.price > price[1]) return false;
      if (L.year < year[0] || L.year > year[1]) return false;
      if (L.km < km[0] || L.km > km[1]) return false;
      if (selRegion.length && !selRegion.includes(L.region)) return false;
      if (showCertOnly && !L.cert) return false;
      return true;
    });
    const cmp = {
      recommended: () => 0,
      new: (a,b) => b.year - a.year,
      price_low: (a,b) => a.price - b.price,
      price_high: (a,b) => b.price - a.price,
      mileage: (a,b) => a.km - b.km,
      year_new: (a,b) => b.year - a.year,
    }[sort] || (() => 0);
    return [...arr].sort(cmp);
  }, [selBrands, selBody, selFuel, price, year, km, selRegion, showCertOnly, sort]);

  // Pagination
  const perPage = 12;
  const pageCount = Math.max(1, Math.ceil(filtered.length / perPage));
  useEffect(() => { setPage(1); }, [filtered.length]);
  const pageItems = filtered.slice((page-1)*perPage, page*perPage);

  // Active filter chips
  const chips = [];
  selBrands.forEach(k => chips.push({ k: 'b:'+k, label: BRANDS.find(b => b.k===k)?.name, onClear: () => toggleIn(selBrands, setSelBrands)(k)}));
  selBody.forEach(k => chips.push({ k: 'body:'+k, label: k, onClear: () => toggleIn(selBody, setSelBody)(k)}));
  selFuel.forEach(k => chips.push({ k: 'fuel:'+k, label: k, onClear: () => toggleIn(selFuel, setSelFuel)(k)}));
  selRegion.forEach(k => chips.push({ k: 'r:'+k, label: k, onClear: () => toggleIn(selRegion, setSelRegion)(k)}));
  if (price[0] !== 300 || price[1] !== 1800) chips.push({ k:'price', label: `${price[0]}–${price[1]}M đ`, onClear: () => setPrice([300,1800]) });
  if (year[0] !== 2019 || year[1] !== 2024) chips.push({ k:'year', label: `${year[0]}–${year[1]}년`, onClear: () => setYear([2019,2024]) });
  if (km[0] !== 0 || km[1] !== 100000) chips.push({ k:'km', label: `${(km[0]/1000)|0}–${(km[1]/1000)|0}만 km`, onClear: () => setKm([0,100000]) });
  if (showCertOnly) chips.push({ k:'cert', label:'VORA 인증만', onClear: () => setShowCertOnly(false) });

  return (
    <div className="lst-shell">

      {/* ── TOP NAV ── */}
      <header className="topnav">
        <div className="topnav__inner">
          <div className="topnav__left">
            <a href="VORA Home.html"><svg viewBox="0 0 174 33" width="75" height="14" style={{color:'var(--vora-ink-90)'}}><use href="#vora-mark"/></svg></a>
            <nav className="topnav__nav">
              <a href="VORA Home.html">홈</a>
              <a href="VORA Listings Screen.html" className="is-active">중고차 검색</a>
              <a href="VORA Dealers.html">딜러 찾기</a>
              <a href="VORA Dealer Lots.html">매매 단지</a>
              <a href="#">시세</a>
              <a href="#">가이드</a>
              <a href="#">커뮤니티</a>
            </nav>
          </div>
          <div className="topnav__right">
            <label className="input">
              <Ic name="search"/>
              <input type="text" placeholder="Toyota Vios, Honda City, 또는 차량번호로 검색" />
            </label>
            <button className="btn btn--s btn--outline-ink">로그인 / 회원가입</button>
          </div>
        </div>
      </header>

      <div className="page">

        {/* ── PAGE HEAD ── */}
        <div className="page__head">
          <div>
            <div className="crumbs">홈 <span>›</span> <b>중고차 검색</b></div>
            <h1 className="page__title">중고차 검색 <em>매물</em></h1>
            <div className="page__count">조건에 맞는 차량 <b>{filtered.length.toLocaleString()}</b>대 · 오늘 신규 <b>128</b>대 등록</div>
          </div>
          <div className="page__head-right">
            <button className="btn btn--s btn--outline-ink"><Ic name="bell"/> 조건 알림 받기</button>
            <button className="btn btn--s"><Ic name="filter"/> 내 차 팔기</button>
          </div>
        </div>

        {/* ── LAYOUT ── */}
        <div className="layout">

          {/* SIDEBAR */}
          <aside className="sidebar">
            <div className="sidebar__head">
              <h3><Ic name="filter" w={14} h={14}/> 검색 필터</h3>
              <button className="reset" onClick={resetAll}>초기화</button>
            </div>
            <div className="sidebar__body">

              <Filter title="제조사" action={selBrands.length ? <span style={{fontSize:11, color:'var(--vora-primary)', fontWeight:700}}>{selBrands.length}</span> : null}>
                {BRANDS.map(b => (
                  <Check key={b.k}
                    checked={selBrands.includes(b.k)}
                    onChange={() => toggleIn(selBrands, setSelBrands)(b.k)}
                    label={b.name} count={b.count}/>
                ))}
              </Filter>

              <Filter title="차종">
                <div className="bodychips">
                  {BODIES.map(b => (
                    <button key={b}
                      className={'bodychip' + (selBody.includes(b) ? ' is-on' : '')}
                      onClick={() => toggleIn(selBody, setSelBody)(b)}>{b}</button>
                  ))}
                </div>
              </Filter>

              <Filter title="가격 (백만 đ)">
                <Range value={price} onChange={setPrice} min={100} max={3000} step={50}
                       format={(v) => v >= 1000 ? (v/1000).toFixed(1) + 'B' : v + 'M'}/>
              </Filter>

              <Filter title="연식">
                <Range value={year} onChange={setYear} min={2015} max={2024} step={1}
                       format={(v) => v + '년'}/>
              </Filter>

              <Filter title="주행거리">
                <Range value={km} onChange={setKm} min={0} max={200000} step={5000}
                       format={(v) => (v/10000).toFixed(0) + '만km'}/>
              </Filter>

              <Filter title="연료">
                {FUELS.map(f => (
                  <Check key={f.k}
                    checked={selFuel.includes(f.k)}
                    onChange={() => toggleIn(selFuel, setSelFuel)(f.k)}
                    label={f.k} count={f.count}/>
                ))}
              </Filter>

              <Filter title="변속기" defaultOpen={false}>
                <div className="bodychips">
                  {TRANS.map(t => (
                    <button key={t}
                      className={'bodychip' + (selTrans.includes(t) ? ' is-on' : '')}
                      onClick={() => toggleIn(selTrans, setSelTrans)(t)}>{t}</button>
                  ))}
                </div>
              </Filter>

              <Filter title="지역" defaultOpen={false}>
                <div className="bodychips">
                  {REGIONS.map(r => (
                    <button key={r}
                      className={'bodychip' + (selRegion.includes(r) ? ' is-on' : '')}
                      onClick={() => toggleIn(selRegion, setSelRegion)(r)}>{r}</button>
                  ))}
                </div>
              </Filter>

              <Filter title="색상" defaultOpen={false}>
                <div className="colordots">
                  {COLORS.map(c => (
                    <button key={c.k}
                      className={'colordot' + (selColor.includes(c.k) ? ' is-on' : '')}
                      style={{ background: c.hex, border: c.ring ? '1px solid var(--vora-line)' : '1px solid transparent' }}
                      onClick={() => toggleIn(selColor, setSelColor)(c.k)}
                      title={c.name}/>
                  ))}
                </div>
              </Filter>

              <Filter title="VORA 인증" defaultOpen={false}>
                <Check checked={showCertOnly} onChange={() => setShowCertOnly(v => !v)}
                       label="365단계 검수 완료 매물"/>
              </Filter>

            </div>
          </aside>

          {/* CONTENT */}
          <main>
            {/* Toolbar */}
            <div className="toolbar">
              <div className="toolbar__chips">
                {chips.length === 0 && (
                  <span style={{fontSize:13, color:'var(--vora-ink-40)', fontWeight:500}}>적용된 필터가 없습니다 — 사이드바에서 조건을 선택하세요.</span>
                )}
                {chips.map(c => (
                  <span key={c.k} className="activechip">
                    {c.label}
                    <button onClick={c.onClear} aria-label="제거"><Ic name="close" w={10} h={10}/></button>
                  </span>
                ))}
                {chips.length > 0 && <button className="clear" onClick={resetAll}>모두 지우기</button>}
              </div>
              <div className="toolbar__right">
                <div className="dropdown" ref={sortRef}>
                  <button className="sort" onClick={() => setSortOpen(o => !o)}>
                    {SORTS.find(s => s.k === sort).label}
                    <Ic name="chevron"/>
                  </button>
                  {sortOpen && (
                    <div className="dropdown__menu">
                      {SORTS.map(s => (
                        <button key={s.k}
                          className={sort === s.k ? 'is-on' : ''}
                          onClick={() => { setSort(s.k); setSortOpen(false); }}>
                          {s.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="viewtog">
                  <button className={view === 'grid' ? 'is-on' : ''} onClick={() => setView('grid')} aria-label="그리드 보기">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                  </button>
                  <button className={view === 'list' ? 'is-on' : ''} onClick={() => setView('list')} aria-label="리스트 보기">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
                  </button>
                </div>
              </div>
            </div>

            {/* GRID / LIST */}
            {pageItems.length === 0 ? (
              <EmptyState onReset={resetAll}/>
            ) : view === 'grid' ? (
              <div className="grid">
                {pageItems.map((L) => <GridCard key={L.id} L={L} liked={!!liked[L.id]} onLike={() => setLiked(m => ({...m, [L.id]: !m[L.id]}))}/>)}
              </div>
            ) : (
              <div className="lst-list">
                {pageItems.map((L) => <RowCard key={L.id} L={L} liked={!!liked[L.id]} onLike={() => setLiked(m => ({...m, [L.id]: !m[L.id]}))}/>)}
              </div>
            )}

            {/* Saved-search nudge */}
            <div className="savebar">
              <div className="savebar__text">
                <div className="savebar__icon"><Ic name="bell" w={20} h={20}/></div>
                <div>
                  <div className="savebar__title">조건에 맞는 신규 매물을 놓치지 마세요</div>
                  <div className="savebar__desc">설정한 필터에 맞는 차량이 등록되면 즉시 알려드립니다.</div>
                </div>
              </div>
              <button className="btn btn--s">조건 저장하기 <Ic name="arrow-right"/></button>
            </div>

            {/* Pagination */}
            <Pager page={page} setPage={setPage} pageCount={pageCount}/>
          </main>
        </div>
      </div>
    </div>
  );
}

function GridCard({ L, liked, onLike }) {
  const variant = BadgeLabel[L.badge];
  return (
    <article className="listing bg-car">
      <div className="listing__shade"/>
      <div className="listing__top">
        <span className={'badge ' + variant.cls}>{variant.label}</span>
        <button className="listing__heart" onClick={onLike} aria-label="찜">
          <svg className="ic" style={{width:14, height:14, color: liked ? '#D9384B' : 'currentColor', fill: liked ? '#D9384B' : 'none'}}><use href="#i-heart"/></svg>
        </button>
      </div>
      <div className="listing__body">
        <div className="listing__name">{L.name}</div>
        <div className="listing__trim">{L.trim}</div>
        <div className="listing__meta">{L.km.toLocaleString()} km <span className="dot"/> <span className="fuel">{L.fuel}</span> <span className="dot"/> {L.region}</div>
        <div className="listing__price">{(L.price * 1_000_000).toLocaleString()}<span className="unit"> đ</span></div>
      </div>
    </article>
  );
}

function RowCard({ L, liked, onLike }) {
  const variant = BadgeLabel[L.badge];
  return (
    <div className="lst-row">
      <div className="lst-row__img bg-car">
        <span className={'badge ' + variant.cls}>{variant.label}</span>
      </div>
      <div className="lst-row__body">
        <div>
          <div className="lst-row__name">{L.name}</div>
          <div className="lst-row__trim">{L.trim}</div>
        </div>
        <div className="lst-row__spec">
          <span>{L.year}년식</span><span className="dot"/>
          <span>{L.km.toLocaleString()} km</span><span className="dot"/>
          <span>{L.fuel}</span><span className="dot"/>
          <span>{L.body}</span>
        </div>
        <div className="lst-row__meta">
          <span><Ic name="shield" w={12} h={12}/> &nbsp;365단계 검수 완료</span>
          <span>· 매물 ID <b>{L.id}</b></span>
          <span>· {L.region} 매매단지</span>
        </div>
      </div>
      <div className="lst-row__right">
        <div style={{textAlign:'right'}}>
          <div className="lst-row__price">{(L.price * 1_000_000).toLocaleString()}<span className="unit"> đ</span></div>
          <span className="badge badge--rise lst-row__rise">
            <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 14 10 10 14 12 18 8"/></svg>
            {L.rise.toFixed(1)}%
          </span>
        </div>
        <div className="lst-row__actions">
          <button className="btn btn--s btn--outline-ink" onClick={onLike}>
            <svg className="ic" style={{width:14, height:14, color: liked ? '#D9384B' : 'currentColor', fill: liked ? '#D9384B' : 'none'}}><use href="#i-heart"/></svg>
            찜
          </button>
          <button className="btn btn--s">상세 보기 <Ic name="arrow-right" w={14} h={14}/></button>
        </div>
      </div>
    </div>
  );
}

function Pager({ page, setPage, pageCount }) {
  const max = Math.min(7, pageCount);
  const start = Math.max(1, Math.min(page - 3, pageCount - max + 1));
  const pages = Array.from({ length: max }, (_, i) => start + i);
  return (
    <div className="pager">
      <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p-1))}>‹</button>
      {pages.map(p => (
        <button key={p} className={p === page ? 'is-on' : ''} onClick={() => setPage(p)}>{p}</button>
      ))}
      <button disabled={page === pageCount} onClick={() => setPage(p => Math.min(pageCount, p+1))}>›</button>
    </div>
  );
}

function EmptyState({ onReset }) {
  return (
    <div style={{
      background:'var(--vora-bg-soft)',
      borderRadius:'var(--vora-r-lg)',
      padding:'80px 40px',
      textAlign:'center',
    }}>
      <div style={{
        width:64, height:64, borderRadius:'50%',
        background:'#fff', margin:'0 auto 20px',
        display:'grid', placeItems:'center',
        color:'var(--vora-ink-40)',
      }}>
        <Ic name="search" w={28} h={28}/>
      </div>
      <div style={{fontSize:20, fontWeight:700, color:'var(--vora-ink-100)', letterSpacing:'-0.5px'}}>조건에 맞는 매물이 없어요</div>
      <div style={{fontSize:14, color:'var(--vora-ink-60)', margin:'8px 0 24px'}}>필터를 조금만 넓혀보세요. 신규 매물이 등록되면 알려드릴게요.</div>
      <button className="btn" onClick={onReset}>필터 초기화</button>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<ListingsApp/>);
