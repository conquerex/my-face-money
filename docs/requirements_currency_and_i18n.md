# 요구사항 정의서: 통화별 배경 이미지 및 다국어 지원 확장

## 1. 개요
본 문서는 My Face Money 서비스의 사용자 경험 개선을 위한 두 가지 주요 요구사항을 정의한다:
1. 엔화(JPY) 모드에서 전용 배경 이미지 적용
2. 다국어 지원에 영어(English) 추가

이를 통해 일본 사용자에게 더욱 현지화된 경험을 제공하고, 글로벌 사용자층 확대를 목표로 한다.

---

## 2. 요구사항 1: 엔화 모드 전용 배경 이미지

### 2.1. 배경 및 목적
현재 KRW(원화) 모드와 JPY(엔화) 모드가 동일한 배경 이미지(`mymoney.png`)를 공유하고 있다. 이는 통화별 정체성을 약화시키고, 일본 사용자에게 이질감을 줄 수 있다.

**목적:**
- 각 통화에 맞는 디자인 정체성 확립
- 사용자가 선택한 통화 모드를 시각적으로 명확히 인식
- 일본 문화와 엔화 디자인 요소를 반영한 현지화

### 2.2. 기능 요구사항

#### 2.2.1. 이미지 파일 사양
- **파일명**: `mymoney-jpy.png`
- **경로**: `images/mymoney-jpy.png`
- **형식**: PNG
- **디자인 요소**:
  - 일본 엔화의 색상 특징 반영 (베이지, 브라운, 그린 톤)
  - 일본 전통 문양 (국화문, 파도문 등) 포함
  - 얼굴 삽입 영역: 중앙 또는 우측에 원형 프레임 (직경 약 30%)
  - 금액 표시 영역: 좌측 하단 (약 7% left, 8% bottom)
  - 전체적으로 우아하고 전통적인 일본 지폐 스타일

#### 2.2.2. 구현 위치
**파일**: `script.js`

**수정 대상**: `CURRENCY_CONFIG` 객체

```javascript
const CURRENCY_CONFIG = {
    KRW: {
        modelURL: "https://teachablemachine.withgoogle.com/models/TzriknE80/",
        prefix: "item_won_",
        moneyBg: "images/mymoney.webp",  // 기존 유지
        overlayColor: "#3d9180",
        strokeColor: "#183722",
        faceFrame: { right: '12%', top: '50%', left: 'auto', transform: 'translateY(-50%)', width: '29.75%', borderRadius: '50%' },
        faceFilter: "sepia(20%) hue-rotate(95deg) saturate(0.8) brightness(1.2) contrast(1.0)"
    },
    JPY: {
        modelURL: "https://teachablemachine.withgoogle.com/models/UvsKhD7ls/",
        prefix: "item_yen_",
        moneyBg: "images/mymoney-jpy.png",  // ← 변경 필요
        overlayColor: "#8b7355",  // 일본 엔화 브라운 톤 (필요시 조정)
        strokeColor: "#3d2f1f",   // 어두운 브라운 외곽선
        faceFrame: { right: '12%', top: '50%', left: 'auto', transform: 'translateY(-50%)', width: '29.75%', borderRadius: '50%' },
        faceFilter: "sepia(30%) hue-rotate(20deg) saturate(0.7) brightness(1.1) contrast(1.05)"  // 브라운 세피아 톤
    }
};
```

#### 2.2.3. 동적 이미지 로딩
**함수**: `predict()` 내부

결과 표시 시 선택된 통화에 따라 적절한 배경 이미지를 로드한다:

```javascript
async function predict() {
    // ... (기존 로직)
    
    const config = CURRENCY_CONFIG[currentCurrency];
    
    // 배경 이미지 설정
    resultMoneyImg.src = config.moneyBg;  // 통화별 이미지 적용
    
    // ... (나머지 로직)
}
```

### 2.3. 테스트 시나리오

#### TC-1: JPY 모드 이미지 표시
1. 사용자가 "일본 엔화 (JPY)" 선택
2. 사진 업로드 및 AI 분석 완료
3. 결과 화면에 `mymoney-jpy.png` 배경 이미지 표시 확인
4. 금액 오버레이 색상이 브라운 톤(`#8b7355`)인지 확인
5. 얼굴 필터가 브라운 세피아 톤으로 적용되었는지 확인

#### TC-2: KRW 모드 이미지 유지
1. 사용자가 "대한민국 원 (KRW)" 선택 (기본값)
2. 사진 업로드 및 AI 분석 완료
3. 결과 화면에 기존 `mymoney.webp` 배경 이미지 표시 확인
4. 금액 오버레이 색상이 녹색 톤(`#3d9180`)인지 확인

#### TC-3: 통화 전환 시 이미지 변경
1. KRW 모드에서 분석 완료 → `mymoney.webp` 표시
2. JPY 모드로 전환 후 재분석 → `mymoney-jpy.png` 표시
3. 각 이미지가 정확히 로드되고 캐싱 없이 변경됨을 확인

### 2.4. 비기능 요구사항
- **성능**: 이미지 로드 시간 2초 이내
- **호환성**: 모든 주요 브라우저(Chrome, Safari, Firefox, Edge)에서 정상 표시
- **접근성**: 이미지에 적절한 `alt` 속성 제공

---

## 3. 요구사항 2: 영어(English) 다국어 지원 추가

### 3.1. 배경 및 목적
현재 서비스는 한국어(KO)와 일본어(JA)만 지원한다. 글로벌 사용자 접근성을 높이기 위해 영어 지원이 필요하다.

**목적:**
- 비한국어권, 비일본어권 사용자의 서비스 이용 가능
- 국제적인 바이럴 마케팅 및 SNS 공유 확대
- SEO 및 글로벌 검색 가시성 향상

### 3.2. 기능 요구사항

#### 3.2.1. TRANSLATIONS 객체 확장
**파일**: `script.js`

**기존 구조**:
```javascript
const TRANSLATIONS = {
    ko: { ... },
    ja: { ... }
};
```

**추가 구조**:
```javascript
const TRANSLATIONS = {
    ko: { ... },
    ja: { ... },
    en: {
        subtitle: "AI Face Value Analysis & Fortune Test",
        krw_label: "South Korean Won (KRW)",
        jpy_label: "Japanese Yen (JPY)",
        usd_label: "US Dollar (USD)",
        upload_text: "Click or drag to upload a photo",
        select_photo: "Select Photo",
        loading_text: "Analyzing with AI model...",
        result_text_pre: "You are worth ",
        result_text_post: ".",
        result_subtitle: "Detailed Analysis Results",
        retry_button: "Try Again",
        how_it_works: "How does it work?",
        currency_unit: "",  // 영어에서는 'bills' 사용 X
        face_preview_alt: "Face preview",
        money_result_alt: "My Face Money - AI Analysis Currency Result",
        your_face_alt: "Your face",
        krw_unit: "KRW",
        jpy_unit: "JPY",
        unit_bill: ""  // 영어에서는 생략 또는 'in banknotes'
    }
};
```

**주의사항**:
- 영어에서는 "17,807원권" → "17,807 KRW" 형태로 표시
- `unit_bill`은 빈 문자열 또는 생략 (영어권에서는 자연스럽지 않음)
- 금액 표현: "You are worth 42,000 KRW." 형태

#### 3.2.2. HTML 언어 선택 UI 수정
**파일**: `index.html`

**기존**:
```html
<div class="language-selector">
    <button onclick="setLanguage('ko')" id="lang-ko" class="active">KO</button>
    <span class="separator">|</span>
    <button onclick="setLanguage('ja')" id="lang-ja">JA</button>
</div>
```

**수정**:
```html
<div class="language-selector">
    <button onclick="setLanguage('ko')" id="lang-ko" class="active">KO</button>
    <span class="separator">|</span>
    <button onclick="setLanguage('en')" id="lang-en">EN</button>
    <span class="separator">|</span>
    <button onclick="setLanguage('ja')" id="lang-ja">JA</button>
</div>
```

#### 3.2.3. 메타 태그 다국어 지원
**파일**: `index.html`

영어 메타 태그 추가:
```html
<!-- 기본 영어 메타 (og:locale:alternate) -->
<meta property="og:locale:alternate" content="en_US">
<meta property="og:locale:alternate" content="ja_JP">
```

### 3.3. 화면별 번역 대상

#### 3.3.1. 메인 화면 (index.html)
| 한국어 | 영어 |
|--------|------|
| AI 얼굴 가치 분석 및 관상 테스트 | AI Face Value Analysis & Fortune Test |
| 대한민국 원 (KRW) | South Korean Won (KRW) |
| 일본 엔화 (JPY) | Japanese Yen (JPY) |
| 미국 달러 (USD) | US Dollar (USD) |
| 사진을 클릭하거나 드래그하여 업로드하세요 | Click or drag to upload a photo |
| 사진 선택하기 | Select Photo |
| AI 모델 분석 중... | Analyzing with AI model... |
| 당신은 [금액] 입니다. | You are worth [amount]. |
| 세부 분석 결과 | Detailed Analysis Results |
| 다시 시도하기 | Try Again |
| 어떻게 계산되나요? | How does it work? |

#### 3.3.2. About 페이지 (about.html)
**별도 작업 필요**: about.html 전체를 i18n 시스템으로 전환하거나, 영어 전용 페이지 `about-en.html` 생성

추천 방식: 
- `about.html` → 한국어 버전 유지
- `about-en.html` → 영어 버전 신규 생성
- `about-ja.html` → 일본어 버전 신규 생성
- 언어 선택 시 자동으로 해당 페이지로 리디렉션

### 3.4. 테스트 시나리오

#### TC-4: 영어 UI 표시
1. 페이지 로드 후 "EN" 버튼 클릭
2. 모든 텍스트가 영어로 변경되는지 확인
3. 통화 선택 레이블, 업로드 안내문, 버튼 텍스트 확인

#### TC-5: 영어 결과 화면
1. 영어 모드에서 사진 업로드
2. 결과 화면에서 "You are worth 17,807 KRW." 형태로 표시 확인
3. 세부 분석 결과에서 "10,000 KRW", "5,000 KRW" 등으로 표시 확인

#### TC-6: 언어 전환
1. KO → EN → JA 순서로 전환
2. 각 언어별로 모든 UI 요소가 즉시 업데이트되는지 확인
3. 결과 화면에서도 언어 전환이 정상 작동하는지 확인

#### TC-7: 브라우저 언어 자동 감지 (선택 사항)
1. 브라우저 언어 설정을 영어로 변경
2. 페이지 최초 로드 시 자동으로 영어 모드로 시작하는지 확인

### 3.5. 추가 고려사항

#### 3.5.1. 기본 언어 설정
현재 기본 언어는 `ko`(한국어)이다. 사용자 브라우저 언어를 감지하여 자동 설정하는 기능 추가 권장:

```javascript
// script.js 초기화 시
let currentLanguage = 'ko';

// 브라우저 언어 감지
const browserLang = navigator.language.slice(0, 2);  // 'en', 'ko', 'ja' 등
if (['ko', 'en', 'ja'].includes(browserLang)) {
    currentLanguage = browserLang;
}

updateUI();
```

#### 3.5.2. URL 파라미터 언어 지정
공유 링크에 언어 정보 포함:
- `https://my-face-money.pages.dev/?lang=en`
- `https://my-face-money.pages.dev/?lang=ja`

```javascript
// URL 파라미터 읽기
const urlParams = new URLSearchParams(window.location.search);
const langParam = urlParams.get('lang');
if (langParam && ['ko', 'en', 'ja'].includes(langParam)) {
    currentLanguage = langParam;
}
```

#### 3.5.3. SEO 다국어 지원
각 언어별 메타 태그 동적 생성:
- `<html lang="en">` 속성 변경
- `<title>`, `<meta name="description">` 다국어 버전
- `hreflang` 태그 추가

---

## 4. 우선순위 및 일정

### 4.1. 우선순위
1. **P0 (최우선)**: 엔화 배경 이미지 적용 (이미 파일 생성 완료)
2. **P1 (높음)**: 영어 TRANSLATIONS 추가 및 메인 화면 적용
3. **P2 (중간)**: 언어 선택 UI 개선 (EN 버튼 추가)
4. **P3 (낮음)**: About 페이지 다국어 지원

### 4.2. 예상 작업 시간
- 엔화 배경 이미지: 0.5시간 (설정 파일 수정만)
- 영어 번역 추가: 1시간 (번역 및 테스트)
- UI 개선: 0.5시간
- About 페이지: 2시간 (별도 페이지 생성 포함)

**총 예상 시간**: 4시간

---

## 5. 개발 체크리스트

### 5.1. 요구사항 1: 엔화 배경 이미지 구현

#### 5.1.1. 이미지 파일 준비
- [ ] `images/mymoney-jpy.png` 파일이 프로젝트에 존재하는지 확인
- [ ] 이미지 크기 및 비율이 적절한지 확인 (가로로 긴 지폐 형태)
- [ ] 얼굴 삽입 영역이 명확히 표시되어 있는지 확인

#### 5.1.2. script.js 수정
- [ ] `CURRENCY_CONFIG` 객체 찾기
- [ ] JPY 설정에서 `moneyBg` 값 변경
  ```javascript
  moneyBg: "images/mymoney-jpy.png"
  ```
- [ ] JPY `overlayColor` 값 확인 및 조정 (현재: `#3d9180` → 브라운 톤으로 변경 권장)
  ```javascript
  overlayColor: "#8b7355"  // 또는 적절한 브라운 톤
  ```
- [ ] JPY `strokeColor` 값 확인 및 조정
  ```javascript
  strokeColor: "#3d2f1f"  // 어두운 브라운
  ```
- [ ] JPY `faceFilter` 값 확인 및 조정 (브라운 세피아 톤)
  ```javascript
  faceFilter: "sepia(30%) hue-rotate(20deg) saturate(0.7) brightness(1.1) contrast(1.05)"
  ```

#### 5.1.3. 로컬 테스트
- [ ] 로컬 서버 실행 (`python3 -m http.server 8000`)
- [ ] JPY 모드 선택
- [ ] 테스트 이미지 업로드
- [ ] 결과 화면에서 `mymoney-jpy.png` 배경 이미지 표시 확인
- [ ] 금액 오버레이 색상이 브라운 톤으로 표시되는지 확인
- [ ] 얼굴 필터 효과가 적절한지 확인
- [ ] KRW 모드로 전환하여 기존 기능 정상 작동 확인 (regression test)

#### 5.1.4. 크로스 브라우저 테스트
- [ ] Chrome에서 테스트
- [ ] Safari에서 테스트
- [ ] Firefox에서 테스트
- [ ] Edge에서 테스트
- [ ] 모바일 브라우저(iOS Safari, Android Chrome)에서 테스트

### 5.2. 요구사항 2: 영어 다국어 지원 구현

#### 5.2.1. TRANSLATIONS 객체 확장
- [ ] `script.js`에서 `TRANSLATIONS` 객체 찾기
- [ ] `en` 객체 추가 (ko, ja와 동일한 구조)
- [ ] 다음 키 값들을 영어로 번역하여 추가:
  - [ ] `subtitle`
  - [ ] `krw_label`
  - [ ] `jpy_label`
  - [ ] `usd_label`
  - [ ] `upload_text`
  - [ ] `select_photo`
  - [ ] `loading_text`
  - [ ] `result_text_pre`
  - [ ] `result_text_post`
  - [ ] `result_subtitle`
  - [ ] `retry_button`
  - [ ] `how_it_works`
  - [ ] `currency_unit` (영어는 빈 문자열)
  - [ ] `face_preview_alt`
  - [ ] `money_result_alt`
  - [ ] `your_face_alt`
  - [ ] `krw_unit`
  - [ ] `jpy_unit`
  - [ ] `unit_bill` (영어는 빈 문자열)

#### 5.2.2. HTML UI 수정 - 언어 선택 버튼
- [ ] `index.html` 파일 열기
- [ ] `.language-selector` 찾기
- [ ] KO와 JA 사이에 EN 버튼 추가
  ```html
  <button onclick="setLanguage('en')" id="lang-en">EN</button>
  <span class="separator">|</span>
  ```
- [ ] 버튼 순서 확인: KO | EN | JA

#### 5.2.3. 메타 태그 다국어 지원 (선택 사항)
- [ ] `index.html`의 `<head>` 섹션에 다음 추가:
  ```html
  <meta property="og:locale:alternate" content="en_US">
  <meta property="og:locale:alternate" content="ja_JP">
  ```

#### 5.2.4. 로컬 테스트 - 영어 모드
- [ ] 페이지 새로고침
- [ ] EN 버튼 클릭
- [ ] 모든 UI 텍스트가 영어로 변경되는지 확인
  - [ ] 제목: "AI Face Value Analysis & Fortune Test"
  - [ ] 통화 레이블: "South Korean Won (KRW)", "Japanese Yen (JPY)"
  - [ ] 업로드 안내: "Click or drag to upload a photo"
  - [ ] 버튼: "Select Photo"
- [ ] 이미지 업로드 및 분석 진행
- [ ] 결과 화면에서 영어 표시 확인
  - [ ] "You are worth [금액] KRW." 형식
  - [ ] "Detailed Analysis Results"
  - [ ] 세부 항목: "10,000 KRW", "5,000 KRW" 등

#### 5.2.5. 언어 전환 테스트
- [ ] KO → EN 전환 테스트
- [ ] EN → JA 전환 테스트
- [ ] JA → KO 전환 테스트
- [ ] 결과 화면에서 언어 전환 시 모든 텍스트 즉시 업데이트 확인
- [ ] 페이지 새로고침 후 마지막 선택 언어 유지 여부 확인 (현재는 항상 KO로 초기화)

#### 5.2.6. 반응형 테스트
- [ ] 모바일 화면에서 언어 선택 버튼 레이아웃 확인
- [ ] 태블릿 화면에서 테스트
- [ ] 데스크톱 화면에서 테스트

### 5.3. 통합 테스트

#### 5.3.1. 기능 조합 테스트
- [ ] KRW + KO 모드 테스트
- [ ] KRW + EN 모드 테스트
- [ ] KRW + JA 모드 테스트
- [ ] JPY + KO 모드 테스트
- [ ] JPY + EN 모드 테스트 (새 배경 이미지 + 영어 UI)
- [ ] JPY + JA 모드 테스트

#### 5.3.2. 엣지 케이스 테스트
- [ ] 매우 큰 이미지 업로드 (5MB 이상)
- [ ] 매우 작은 이미지 업로드 (100KB 미만)
- [ ] 얼굴이 없는 이미지 업로드
- [ ] 여러 얼굴이 있는 이미지 업로드
- [ ] 빠르게 언어 전환 반복 (10회 이상)
- [ ] 빠르게 통화 전환 반복 (10회 이상)

#### 5.3.3. 성능 테스트
- [ ] 이미지 로드 시간 측정 (2초 이내)
- [ ] 언어 전환 응답 시간 (즉시)
- [ ] 통화 전환 응답 시간 (즉시)
- [ ] 메모리 누수 확인 (DevTools 사용)

### 5.4. 코드 품질 체크

#### 5.4.1. 코드 리뷰
- [ ] `CURRENCY_CONFIG` 설정값 검토
- [ ] `TRANSLATIONS` 객체 구조 일관성 확인
- [ ] 하드코딩된 문자열이 남아있지 않은지 확인
- [ ] 콘솔 에러 없는지 확인

#### 5.4.2. 린터 확인
- [ ] JavaScript 문법 에러 없음
- [ ] HTML 유효성 검사 통과
- [ ] CSS 유효성 검사 통과

#### 5.4.3. 접근성 체크
- [ ] 모든 이미지에 적절한 `alt` 속성 있음
- [ ] 언어 선택 버튼에 명확한 레이블
- [ ] 키보드 네비게이션 가능

### 5.5. 문서화

- [ ] 변경사항을 README.md에 반영 (있는 경우)
- [ ] 커밋 메시지 작성
  - [ ] 엔화 이미지: "feat: add JPY currency background image"
  - [ ] 영어 지원: "feat: add English language support"
- [ ] 요구사항 문서와 실제 구현 일치 확인

---

## 6. 검수 및 배포

### 6.1. 최종 검수 체크리스트
- [ ] JPY 모드에서 `mymoney-jpy.png` 정상 표시
- [ ] JPY 모드 색상 필터 및 오버레이 적절성 확인
- [ ] KRW 모드 기존 기능 정상 작동 (regression test)
- [ ] 영어 번역 품질 검수 (native speaker 확인 권장)
- [ ] 모든 화면에서 언어 전환 정상 작동
- [ ] 모바일 반응형 레이아웃 확인
- [ ] 크로스 브라우저 테스트 (Chrome, Safari, Firefox, Edge)

### 6.2. 배포 전략
1. **Stage 1**: 엔화 이미지 적용 → 즉시 배포
2. **Stage 2**: 영어 번역 추가 → 내부 테스트 후 배포
3. **Stage 3**: About 페이지 다국어화 → 별도 배포

---

## 7. 참고 자료

### 7.1. 관련 파일
- `script.js`: 메인 로직 및 다국어 시스템
- `index.html`: 메인 페이지 UI
- `about.html`: 설명 페이지
- `images/mymoney.webp`: KRW 배경 이미지
- `images/mymoney-jpy.png`: JPY 배경 이미지 (신규)

### 7.2. 디자인 참고
- 일본 엔화 실물 지폐 이미지
- Google Material Design 다국어 가이드
- W3C i18n Best Practices

---

**문서 버전**: 1.2  
**작성일**: 2026-01-23  
**최종 수정일**: 2026-01-23  
**작성자**: AI Assistant  
**승인 상태**: 최종 확정

**변경 이력**:
- v1.0 (2026-01-23): 초안 작성
- v1.1 (2026-01-23): 향후 확장 계획 섹션 제거
- v1.2 (2026-01-23): 개발 체크리스트 섹션 추가
