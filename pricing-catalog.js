// 단일 소스: 모바일(app.js)과 PC 웹(desktop.js)이 이 카탈로그를 함께 사용합니다.
// 단가/SKU를 변경할 때는 이 파일 하나만 수정하면 두 화면에 동일하게 반영됩니다.
// usdToKrw: 참고용 고정 환율. 실제 계약/청구 시점 환율로 주기적으로 갱신하세요.
const PRICING_CATALOG_META = { updatedAt: '2026-05', usdToKrw: 1380 };
const PRICING_CATALOG = {
  compute: [
    {id:'e6', family:'AMD EPYC', name:'VM.Standard.E6.Flex', sub:'AMD E6 · Flexible VM', cpu:.03, mem:.002, ocpu:4, gb:32, on:true},
    {id:'s4', family:'INTEL XEON', name:'VM.Standard4.Flex', sub:'Intel Standard4 · Flexible VM', cpu:.0255, mem:.0015, ocpu:4, gb:32, on:false}
  ],
  iaas: [
    {id:'block', icon:'▰', name:'Block Volume · Balanced', unit:'GB / 월', rate:.0334203, qty:500, on:true},
    {id:'object', icon:'◒', name:'Object Storage · Standard', unit:'GB / 월', rate:.0255, qty:1000, on:true},
    {id:'backup', icon:'↶', name:'Object Storage · Backup', unit:'GB / 월', rate:.00255, qty:1000, on:false},
    {id:'network', icon:'↔', name:'Network Egress', unit:'GB / 월', rate:.0085, qty:1000, on:false},
    {id:'vcn', icon:'⌘', name:'VCN', unit:'VCN / 월', rate:0, qty:1, on:false}
  ],
  database: [
    {id:'db-li', icon:'▣', name:'Base Database EE · LI', unit:'OCPU / 시간', rate:.56368906, qty:2, on:true},
    {id:'db-byol', icon:'▣', name:'Base Database EE · BYOL', unit:'OCPU / 시간', rate:.3226, qty:2, on:false},
    {id:'db-storage', icon:'▰', name:'Database Storage', unit:'GB / 월', rate:.08, qty:512, on:true}
  ],
  exacs: [
    {id:'exacs-infra', icon:'◈', name:'Exadata X9M · Quarter Rack', unit:'환경 / 시간', rate:19.02493172, qty:1, on:false},
    {id:'exacs-ocpu', icon:'◈', name:'Exadata DB OCPU · LI', unit:'OCPU / 시간', rate:1.76157746, qty:8, on:false},
    {id:'exacs-byol', icon:'◈', name:'Exadata DB OCPU · BYOL', unit:'OCPU / 시간', rate:.42277859, qty:8, on:false}
  ],
  autonomous: [
    {id:'adb-ecpu', icon:'✦', name:'Autonomous AI Database · ECPU', unit:'ECPU / 시간', rate:.4403616, qty:2, on:false},
    {id:'adb-byol', icon:'✦', name:'Autonomous AI Database · BYOL', unit:'ECPU / 시간', rate:.10576542, qty:2, on:false},
    {id:'adb-storage', icon:'▰', name:'Autonomous Exadata Storage', unit:'GB / 월', rate:.03197864, qty:1024, on:false},
    {id:'adb-backup', icon:'↶', name:'Autonomous Backup Storage', unit:'GB / 월', rate:.03197864, qty:1024, on:false}
  ]
};

// 각 화면이 독립적으로 상태(on/qty/rate)를 변경할 수 있도록 매번 깊은 복사본을 내준다.
function clonePricingCatalog(){
  return JSON.parse(JSON.stringify(PRICING_CATALOG));
}

// group별 객체를 {..item, group} 형태의 평면 배열로 변환 (PC 웹 테이블 렌더링용).
function flattenPricingCatalog(catalog){
  return Object.entries(catalog).flatMap(([group, list])=>list.map(item=>({...item, group})));
}
