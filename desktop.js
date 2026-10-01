const items=flattenPricingCatalog(clonePricingCatalog());
let currency='USD', usdToKrw=PRICING_CATALOG_META.usdToKrw;
const $=s=>document.querySelector(s), money=n=>currency==='KRW'?'₩'+Math.round(n*usdToKrw).toLocaleString('ko-KR'):'$'+Math.round(n).toLocaleString('en-US'), hours=()=>+$('#hours').value, discount=()=>+$('#discount').value/100;
const isHourly=x=>x.unit.includes('시간');
const cost=x=>x.group==='compute'?(x.ocpu*x.cpu+x.gb*x.mem)*hours():x.qty*x.rate*(isHourly(x)?hours():1);
function computeCards(){ $('#computeCards').innerHTML=items.filter(x=>x.group==='compute').map(x=>`<article class="compute ${x.on?'selected':''}"><div class="compute-head"><span class="badge">${x.family}</span><input class="switch" type="checkbox" data-switch="${x.id}" ${x.on?'checked':''}></div><h3>${x.name}</h3><p>${x.sub}</p><div class="amount">${money(cost(x))}<small>/월</small></div><div class="fields"><label>OCPU<input type="number" min="1" data-compute="${x.id}:ocpu" value="${x.ocpu}"></label><label>메모리 GB<input type="number" min="1" data-compute="${x.id}:gb" value="${x.gb}"></label></div></article>`).join('') }
function lines(){ $('#lines').innerHTML=items.map(x=>`<tr><td><input class="check" type="checkbox" data-switch="${x.id}" ${x.on?'checked':''}></td><td><b>${x.name}</b></td><td>${x.group==='compute'?'OCPU·GB / 시간':x.unit}</td><td>${x.group==='compute'?`${x.ocpu} OCPU / ${x.gb} GB`:`<input type="number" min="0" data-field="${x.id}:qty" value="${x.qty}">`}</td><td>${x.group==='compute'?`$${x.cpu.toFixed(4)} / $${x.mem.toFixed(4)}`:`<input type="number" min="0" step=".0001" data-field="${x.id}:rate" value="${x.rate}">`}</td><td>${money(x.on?cost(x):0)}</td></tr>`).join('') }
function chart(){const cs=items.filter(x=>x.group==='compute'),max=Math.max(...cs.map(cost),1);$('#barChart').innerHTML=cs.map((x,i)=>`<div class="bar-row"><span>${x.family}</span><div class="track"><div class="bar ${i===1?'intel':''}" style="width:${cost(x)/max*100}%"></div></div><b>${money(cost(x))}</b></div>`).join('');const amd=cost(cs[0]),intel=cost(cs[1]);$('#chartNote').textContent=`동일 사양에서 ${cs[0].family}는 ${cs[1].family} 대비 ${money(Math.abs(amd-intel))}/월 ${amd<intel?'낮음':'높음'} (선택 여부와 무관한 비교).`;$('#chartHours').textContent=hours()}
function update(){computeCards();lines();chart();const total=items.filter(x=>x.on).reduce((a,x)=>a+cost(x),0),annual=total*12,term=annual*3*(1-discount());$('#monthly').textContent=money(total);$('#annual').textContent=money(annual);$('#term').textContent=money(term);$('#saving').textContent=money(annual*3-term);$('#discountText').textContent=Math.round(discount()*100)+'%';$('#termNote').textContent=`PAYG 대비 ${Math.round(discount()*100)}% 할인`;$('#tableTotal').textContent=money(total);$('#quoteMeta').textContent=`${$('#region').value} · ${hours()}시간/월 기준 · OCI Global Price List는 리전 간 동일 USD 단가`}
document.addEventListener('input',e=>{if(e.target.id==='fxRate')return $('#fxReload').classList.toggle('pending',+e.target.value!==usdToKrw);if(e.target.id==='discount'||e.target.id==='hours'||e.target.id==='region')return update();const [id,field]=(e.target.dataset.field||e.target.dataset.compute||'').split(':');if(id){items.find(x=>x.id===id)[field]=+e.target.value;update()}});document.addEventListener('change',e=>{if(e.target.dataset.switch){const x=items.find(x=>x.id===e.target.dataset.switch);x.on=e.target.checked;update()}});
$('#currency').onclick=()=>{currency=currency==='USD'?'KRW':'USD';$('#currency').textContent=currency;update()};
$('#csv').onclick=()=>{
  const region=$('#region').value, fx=currency==='KRW'?usdToKrw:1, conv=n=>Math.round(n*fx*100)/100;
  const rows=[
    ['OCI 견적 도우미 견적서'],
    ['리전',region],['기준 시간',`${hours()}시간/월`],['3년 약정 할인',`${Math.round(discount()*100)}%`],['통화',currency],['환율',`1 USD = ${usdToKrw} KRW (${PRICING_CATALOG_META.fxBasis})`],
    ['서비스',`월 비용 (${currency})`,`연 비용 (${currency})`,`3년 약정 (${currency})`],
    ...items.filter(x=>x.on).map(x=>[x.name,conv(cost(x)),conv(cost(x)*12),conv(cost(x)*36*(1-discount()))])
  ];
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(["\ufeff"+rows.map(x=>x.join(',')).join('\n')],{type:'text/csv'}));a.download='oci-estimate-desktop.csv';a.click()
};
// 입력한 환율을 적용하고 원화 금액을 다시 계산한다. 잘못된 값이면 직전 환율로 되돌린다.
const applyFx=()=>{const v=+$('#fxRate').value;if(v>0)usdToKrw=v;else $('#fxRate').value=usdToKrw;$('#fxReload').classList.remove('pending');update()};
$('#fxReload').onclick=applyFx;$('#fxRate').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();applyFx()}});
$('#fxRate').value=usdToKrw;$('#fxBasis').textContent=PRICING_CATALOG_META.fxBasis;
update();
