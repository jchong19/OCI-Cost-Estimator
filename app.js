const H = () => +document.querySelector('#hours').value;
let currency = 'USD';
const money = n => currency === 'KRW' ? '₩' + Math.round(n * PRICING_CATALOG_META.usdToKrw).toLocaleString('ko-KR') : '$' + Math.round(n).toLocaleString('en-US');
const rate = n => '$' + n.toFixed(n < .1 ? 4 : 2);
const catalog = clonePricingCatalog();
function isHourly(s){return s.unit.includes('시간')}
function monthly(s){return s.qty * s.rate * (isHourly(s) ? H() : 1)}
function selected(){return Object.values(catalog).flat().filter(x=>x.id && x.on && !x.cpu)}
function computeMonthly(c){return (c.ocpu*c.cpu + c.gb*c.mem)*H()}
function renderCompute(){
  document.querySelector('#computeCards').innerHTML=catalog.compute.map(c=>`<article class="compute-card ${c.on?'selected':''}"><button class="toggle ${c.on?'on':''}" data-compute="${c.id}"></button><span class="chip">${c.family}</span><h3>${c.name}</h3><p>${c.sub}</p><div class="rate">${rate(c.cpu)}/OCPU-h · ${rate(c.mem)}/GB-h</div><div class="monthly">${money(computeMonthly(c))}<small>/월</small></div><div class="shape-controls"><label>OCPU<input type="number" min="1" data-cfield="ocpu" data-id="${c.id}" value="${c.ocpu}"></label><label>메모리 GB<input type="number" min="1" data-cfield="gb" data-id="${c.id}" value="${c.gb}"></label></div></article>`).join('');
}
function renderServices(group){document.querySelector('#'+group+'Services').innerHTML=catalog[group].map(s=>`<article class="service-row ${s.on?'selected':''}"><button class="toggle ${s.on?'on':''}" data-service="${group}:${s.id}"></button><div class="service-icon">${s.icon}</div><div><div class="service-name">${s.name}</div><div class="service-meta">${rate(s.rate)} · ${s.unit}</div></div><div class="service-cost">${money(monthly(s))}<small>/월</small></div><div class="service-control"><label>수량<input type="number" min="0" data-field="qty" data-group="${group}" data-id="${s.id}" value="${s.qty}"></label><label>단가 USD<input type="number" min="0" step=".0001" data-field="rate" data-group="${group}" data-id="${s.id}" value="${s.rate}"></label></div></article>`).join('')}
function update(){
  renderCompute(); ['iaas','database','exacs','autonomous'].forEach(renderServices);
  const items=[...catalog.compute.filter(x=>x.on).map(c=>({name:c.name,detail:`${c.ocpu} OCPU · ${c.gb} GB · ${H()}h`,cost:computeMonthly(c)})),...selected().map(s=>({name:s.name,detail:`${s.qty.toLocaleString()} ${s.unit}`,cost:monthly(s)}))];
  const total=items.reduce((a,b)=>a+b.cost,0), discount=+document.querySelector('#discount').value/100, annual=total*12, term=annual*3*(1-discount), payg=annual*3;
  document.querySelector('#monthlyTotal').textContent=money(total);document.querySelector('#annualTotal').textContent=money(annual);document.querySelector('#termTotal').textContent=money(term);document.querySelector('#savingTotal').textContent=money(payg-term);document.querySelector('#effectiveDiscount').textContent=`${Math.round(discount*100)}%`;document.querySelector('#discountLabel').textContent=`${Math.round(discount*100)}%`;document.querySelector('#iaasCount').textContent=`${items.filter(x=>x.name.includes('VM.')||['Block','Object','Network','VCN'].some(v=>x.name.startsWith(v))).length}개 선택`;
  document.querySelector('#breakdown').innerHTML=items.length?items.map(i=>`<div class="breakdown-row"><div>${i.name}<small>${i.detail}</small></div><div>${money(i.cost)}<small>월 비용</small></div></div>`).join(''):'<p class="section-help">선택한 항목이 없습니다.</p>';
  document.querySelector('#quoteMeta').textContent=`${document.querySelector('#region').value} · ${H()}시간/월 기준 · OCI Global Price List는 리전 간 동일 USD 단가`;
}
function lookup(group,id){return catalog[group].find(x=>x.id===id)}
document.addEventListener('click',e=>{const c=e.target.dataset.compute,s=e.target.dataset.service;if(c){lookup('compute',c).on=!lookup('compute',c).on;update()}if(s){const[g,id]=s.split(':');lookup(g,id).on=!lookup(g,id).on;update()}if(e.target.matches('.tab')){document.querySelectorAll('.tab,.tab-panel').forEach(x=>x.classList.remove('active'));e.target.classList.add('active');document.querySelector('#'+e.target.dataset.tab).classList.add('active')}if(e.target.id==='download')downloadCsv();if(e.target.id==='reset'){location.reload()}if(e.target.id==='currency'){currency=currency==='USD'?'KRW':'USD';e.target.textContent=currency;update()}});
document.addEventListener('input',e=>{if(e.target.id==='discount'){update()} if(e.target.id==='hours'){update()} if(e.target.id==='region'){update()} if(e.target.dataset.field){lookup(e.target.dataset.group,e.target.dataset.id)[e.target.dataset.field]=+e.target.value;update()}if(e.target.dataset.cfield){lookup('compute',e.target.dataset.id)[e.target.dataset.cfield]=+e.target.value;update()}});
function downloadCsv(){
  const discount=+document.querySelector('#discount').value/100, region=document.querySelector('#region').value;
  const fx=currency==='KRW'?PRICING_CATALOG_META.usdToKrw:1, conv=n=>Math.round(n*fx*100)/100;
  const rows=[
    ['OCI 견적 도우미 견적서'],
    ['리전',region],['기준 시간',`${H()}시간/월`],['3년 약정 할인',`${Math.round(discount*100)}%`],['통화',currency],
    ['서비스',`월 비용 (${currency})`,`연 비용 (${currency})`,`3년 약정 (${currency})`],
    ...catalog.compute.filter(x=>x.on).map(x=>[x.name,conv(computeMonthly(x)),conv(computeMonthly(x)*12),conv(computeMonthly(x)*36*(1-discount))]),
    ...selected().map(x=>[x.name,conv(monthly(x)),conv(monthly(x)*12),conv(monthly(x)*36*(1-discount))])
  ];
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(["\ufeff"+rows.map(r=>r.join(',')).join('\n')],{type:'text/csv'}));a.download='oci-estimate.csv';a.click();document.querySelector('#toast').textContent='CSV 견적서를 다운로드했습니다.';document.querySelector('#toast').classList.add('show');setTimeout(()=>document.querySelector('#toast').classList.remove('show'),2200)
}
document.querySelector('#hours').addEventListener('change',update);update();
