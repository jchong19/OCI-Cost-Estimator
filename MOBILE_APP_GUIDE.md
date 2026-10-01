# OCI 견적 도우미를 휴대폰 앱으로 사용하는 방법

## 가장 빠른 방법: PWA로 설치

이 견적 도구는 브라우저 기반 앱이며, `manifest.webmanifest`와 Service Worker(`sw.js`)가 이미 포함되어 있어 iPhone과 Android에서 홈 화면 앱처럼 설치할 수 있습니다. 현재 배포 주소: https://jchong19.github.io/OCI-Cost-Estimator/ 로그인이나 앱스토어 심사가 필요 없는 영업용 배포에 가장 적합합니다.

1. 소스 파일을 GitHub, Oracle Cloud Object Storage Static Website, Netlify 또는 Vercel에 배포합니다.
2. HTTPS 주소를 만듭니다. PWA 설치는 HTTPS가 필요합니다.
3. iPhone Safari에서 주소를 열고 공유 버튼 → `홈 화면에 추가`를 선택합니다.
4. Android Chrome에서 주소를 열고 메뉴 → `앱 설치` 또는 `홈 화면에 추가`를 선택합니다.
5. 홈 화면의 `OCI 견적 도우미` 아이콘으로 실행합니다.

## 앱스토어 배포가 필요한 경우

PWA를 Capacitor로 감싸면 현재 HTML/CSS/JavaScript를 거의 그대로 iOS/Android 네이티브 앱으로 패키징할 수 있습니다.

1. Node.js 20 이상과 Android Studio를 설치합니다. iOS는 macOS와 Xcode가 필요합니다.
2. 프로젝트 폴더에서 `npm create vite@latest`로 빈 웹 프로젝트를 만들고, 현재 정적 파일을 빌드 결과 폴더로 옮깁니다.
3. `npm install @capacitor/core @capacitor/cli` 후 `npx cap init`으로 앱 ID(예: `com.oracle.ociestimator`)를 설정합니다.
4. `npm install @capacitor/android @capacitor/ios` 후 `npx cap add android`, `npx cap add ios`를 실행합니다.
5. 웹 파일을 빌드하고 `npx cap sync`로 네이티브 프로젝트에 반영합니다.
6. `npx cap open android` 또는 `npx cap open ios`로 열어 실제 기기에서 테스트합니다.
7. 각 스토어의 개발자 계정, 앱 아이콘, 개인정보처리방침을 준비한 뒤 Play Console / App Store Connect에서 제출합니다.

## 권장 운영 방식

- 영업 현장 배포: PWA. 가격 카탈로그를 한 곳에서 갱신하고 즉시 전 영업에게 배포할 수 있습니다.
- 오프라인 견적, 카메라/파일 공유, MDM 배포: Capacitor 네이티브 앱.
- 실제 단가 갱신: 단가는 `pricing-catalog.js` 한 파일에서 관리합니다(필요 시 내부 API로 전환). 변경일, SKU, 리전, 통화, PAYG/BYOL을 함께 저장하고 최종 견적은 OCI Cost Estimator에서 재확인합니다.

## iPhone에서 바로 보기 위한 임시 방법

파일을 휴대폰으로 전송하는 것보다 웹에 배포하는 편이 안전합니다. iPhone의 Safari는 로컬 HTML 파일 실행에 제약이 있으므로, HTTPS로 배포한 URL을 Safari로 열어 홈 화면에 추가하세요.
