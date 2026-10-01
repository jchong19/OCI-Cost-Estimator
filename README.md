# OCI 견적 도우미

영업 현장에서 Oracle Cloud Infrastructure(OCI) 서비스 조합의 월/연/3년 약정 비용을 빠르게 산정하는 브라우저 기반 견적 도구입니다. 빌드 과정이나 서버 없이 정적 HTML/CSS/JavaScript만으로 동작합니다.

**바로 사용하기:** https://jchong19.github.io/OCI-Cost-Estimator/ (모바일) · https://jchong19.github.io/OCI-Cost-Estimator/desktop.html (PC)

> 이 도구의 결과는 **참고용 개략 견적**입니다. 최종 제안 전에는 반드시 [공식 OCI 가격](https://www.oracle.com/cloud/pricing/) 및 OCI Cost Estimator, 계약/할인 조건으로 재확인하세요.

## 화면 구성

| 화면 | 파일 | 용도 |
| --- | --- | --- |
| 모바일 앱 | `index.html` + `app.js` + `style.css` | 휴대폰에서 탭(IaaS / Base DB / ExaCS / Autonomous)별로 서비스를 선택하고 월 비용 구성 확인 |
| PC 웹 | `desktop.html` + `desktop.js` + `desktop.css` | KPI 카드, AMD vs Intel Compute 비교 차트, 전체 SKU 견적 테이블 |

두 화면은 상단 링크(`PC 웹 보기 ↗` / `모바일 앱 보기 ↗`)로 서로 이동할 수 있으며, 같은 가격 카탈로그(`pricing-catalog.js`)를 공유합니다.

## 실행 방법

설치할 것이 없습니다. 아래 중 하나를 선택하세요.

```bash
# 1) 파일을 브라우저로 바로 열기
open index.html          # 모바일 화면
open desktop.html        # PC 웹 화면

# 2) 로컬 웹 서버로 실행 (휴대폰에서 같은 네트워크로 접속해 확인할 때 편리)
python3 -m http.server 8000
# → http://localhost:8000/index.html, http://localhost:8000/desktop.html
```

폰트는 Google Fonts(Noto Sans KR, DM Mono)에서 불러오므로, 오프라인에서는 시스템 기본 폰트로 표시됩니다.

## 휴대폰에서 사용하기 (홈 화면 앱)

위 URL을 휴대폰에서 열고 홈 화면에 추가하면 앱처럼 전체 화면으로 실행됩니다. 한 번 열어 두면 오프라인에서도 동작합니다.

- **iPhone (Safari)**: 공유 버튼 → `홈 화면에 추가`
- **Android (Chrome)**: 메뉴(⋮) → `앱 설치` 또는 `홈 화면에 추가`

`main` 브랜치에 push하면 GitHub Pages에 1~2분 내 자동 반영됩니다. 온라인 상태에서는 항상 최신 파일을 받아오므로(네트워크 우선 캐시) 단가를 수정해도 사용자가 따로 업데이트할 필요가 없습니다.

## 주요 기능

- **서비스 선택**: Compute Flex(AMD E6 / Intel Standard4), Block/Object Storage, Network Egress, Base Database(LI/BYOL), Exadata Cloud Service, Autonomous Database
- **수량·단가 직접 수정**: 고객 협상 단가나 사양에 맞춰 화면에서 바로 변경 (변경 내용은 저장되지 않으며 새로고침 시 초기화)
- **공통 조건**: 리전, 월 기준 시간(720 / 730 / 744시간), 3년 약정 할인율(0–55%)
- **통화 전환**: USD ↔ KRW
- **환율**: 기본값 FY27 `1 USD = ₩1,445.3692`. 상단 `기준 시간` 옆 입력란에서 수정한 뒤 ↻ 버튼(또는 Enter)을 누르면 원화 금액과 CSV가 다시 계산됩니다. 수정한 환율은 저장되지 않으며 새로고침하면 기본값으로 돌아갑니다.
- **CSV 내보내기**: 선택 항목의 월/연/3년 약정 비용을 엑셀에서 열 수 있는 CSV(UTF-8 BOM)로 저장
  - 모바일: `oci-estimate.csv`, PC 웹: `oci-estimate-desktop.csv`

## 비용 계산 방식

| 항목 | 계산식 |
| --- | --- |
| Compute Flex 월 비용 | `(OCPU × OCPU 단가 + 메모리 GB × GB 단가) × 월 기준 시간` |
| 시간 단위 SKU (단위에 `시간` 포함) | `수량 × 단가 × 월 기준 시간` |
| 월 단위 SKU (예: `GB / 월`) | `수량 × 단가` |
| 연 비용 | `월 비용 × 12` |
| 3년 약정 비용 | `연 비용 × 3 × (1 − 할인율)` |
| 3년 절감액 | `연 비용 × 3 − 3년 약정 비용` |

- 모든 단가는 USD 기준이며, OCI Global Price List는 리전 간 동일 USD 단가를 사용하므로 리전 선택은 견적서 표기용입니다.
- KRW 표시는 화면에 적용된 환율(기본값 `PRICING_CATALOG_META.usdToKrw`)로 단순 환산합니다.
- 세금, Support, Marketplace 비용은 포함되지 않습니다.

## 가격 카탈로그 수정

단가와 SKU는 **`pricing-catalog.js` 한 파일**에서 관리하며, 수정하면 모바일과 PC 웹에 동일하게 반영됩니다.

```js
const PRICING_CATALOG_META = { updatedAt: '2026-05', usdToKrw: 1445.3692, fxBasis: 'FY27' };
const PRICING_CATALOG = {
  compute:    [ /* Compute Flex shape */ ],
  iaas:       [ /* 스토리지 · 네트워크 */ ],
  database:   [ /* Base Database */ ],
  exacs:      [ /* Exadata Cloud Service */ ],
  autonomous: [ /* Autonomous Database */ ]
};
```

**항목 필드**

| 그룹 | 필드 | 설명 |
| --- | --- | --- |
| `compute` | `id`, `family`, `name`, `sub` | 식별자, 칩 제조사 표시, Shape 이름, 부가 설명 |
| | `cpu`, `mem` | OCPU당 / 메모리 GB당 시간 단가(USD) |
| | `ocpu`, `gb` | 기본 사양 |
| 그 외 | `id`, `icon`, `name` | 식별자, 표시 아이콘, 서비스 이름 |
| | `unit` | 과금 단위. **`시간`이 포함되면 월 기준 시간을 곱합니다** (예: `OCPU / 시간`) |
| | `rate`, `qty` | 단가(USD), 기본 수량 |
| 공통 | `on` | 기본 선택 여부 |

**가격 갱신 시 체크리스트**

1. `PRICING_CATALOG_META.updatedAt`을 갱신합니다. 회계연도가 바뀌면 `usdToKrw`와 `fxBasis`(화면 표시용, 예: `FY28`)도 함께 바꿉니다.
2. 화면에 하드코딩된 가격 기준 문구도 함께 수정합니다.
   - `index.html` 하단 footer (`Global Price List (2026-05)`)
   - `desktop.html` 사이드바 `aside-note` (`2026-05 · USD`)
3. 새 그룹을 추가하는 경우 모바일 화면(`index.html`의 탭/섹션, `app.js`의 `update()` 그룹 목록)도 함께 추가해야 합니다. PC 웹 테이블은 자동으로 표시됩니다.
4. PC 웹의 Compute 비교 차트는 `compute` 배열의 **첫 번째와 두 번째 항목**(AMD, Intel)을 비교하므로 순서를 유지하세요.

## 파일 구조

```
.
├── index.html            # 모바일 앱 화면
├── app.js                # 모바일 화면 로직 (렌더링, 계산, CSV)
├── style.css             # 모바일 스타일
├── desktop.html          # PC 웹 화면
├── desktop.js            # PC 웹 로직 (KPI, 비교 차트, 견적 테이블, CSV)
├── desktop.css           # PC 웹 스타일
├── pricing-catalog.js    # 공유 가격 카탈로그 (단일 소스)
├── manifest.webmanifest # 홈 화면 앱(PWA) 정보
├── sw.js                # 오프라인 캐시 Service Worker (파일 추가 시 ASSETS·CACHE 버전 갱신)
├── pwa.js               # Service Worker 등록
├── icons/               # 앱 아이콘 (SVG 원본 + PNG)
└── MOBILE_APP_GUIDE.md   # 휴대폰 앱(PWA / Capacitor) 배포 가이드
```

## 배포

GitHub Pages로 배포됩니다(저장소 Settings → Pages). 정적 파일만 있으므로 OCI Object Storage 정적 웹사이트, Netlify, Vercel 등 다른 정적 호스팅에도 그대로 올릴 수 있습니다. 앱스토어 배포 방법은 [MOBILE_APP_GUIDE.md](MOBILE_APP_GUIDE.md)를 참고하세요.
