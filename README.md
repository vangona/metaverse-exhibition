# Metaverse Exhibition - Solace Piano Visualization

![스크린샷 2025-06-09 오전 5 07 58](https://github.com/user-attachments/assets/d605c435-ab79-4f83-b44f-734f497c04f1)

[실시간 오디오 시각화를 통한 몰입형 피아노 연주 전시회](https://vercel.com/vangonas-projects/metaverse-exhibition)

## 🎹 프로젝트 소개

**Metaverse Exhibition**은 "Liszt의 Solace" 피아노 연주를 3D 공간에서 시각화하는 웹 애플리케이션입니다. 음악의 크기와 높낮이에 따라 실시간으로 반응하는 도형과 입자를 통해 사용자에게 몰입감 있는 청각-시각적 경험을 제공합니다.

https://github.com/user-attachments/assets/67e4544e-ce6c-40c5-b6b4-6d94fc71d66d

### ✨ 주요 특징

- **실시간 오디오 시각화**: Web Audio API를 활용한 주파수 분석 기반 파티클 애니메이션
- **3D 공간 탐색**: Three.js 기반의 3차원 환경에서 자유로운 시점 조작
- **직관적인 UI**: 마우스 움직임 감지 기반의 자동 숨김/표시 인터페이스
- **몰입형 디자인**: 음악에 집중할 수 있는 미니멀한 사용자 경험

## 🛠️ 기술 스택

### Core Technologies
- **React 18** - 컴포넌트 기반 UI 프레임워크
- **Three.js** - 3D 그래픽 렌더링
- **Cannon-ES** - 물리 엔진 (Physics simulation)
- **Web Audio API** - 실시간 오디오 분석

### Additional Libraries
- **@react-three/fiber** - React용 Three.js 통합
- **@react-three/drei** - Three.js 유틸리티 컴포넌트
- **@react-three/cannon** - React용 물리 엔진 통합
- **styled-components** - CSS-in-JS 스타일링
- **lil-gui** - 디버그 인터페이스 (개발용)

### Development Tools
- **Create React App** - 프로젝트 빌드 도구
- **React Router DOM** - 클라이언트 사이드 라우팅

## 🚀 설치 및 실행

### 요구사항
- Node.js 16+ 
- npm 7+

### 설치 과정

```bash
# 저장소 클론
git clone [repository-url]
cd metaverse-exhibition

# 의존성 설치
npm install

# 개발 서버 실행
npm start
```

### 빌드 및 배포

```bash
# 프로덕션 빌드
npm run build

# GitHub Pages 배포
npm run deploy
```

## 🎮 사용법

### 기본 조작
- **재생/일시정지**: 화면 하단 중앙의 플레이 버튼 클릭
- **시점 회전**: 마우스 좌클릭 + 드래그
- **줌 인/아웃**: 마우스 휠 스크롤
- **시점 이동**: 마우스 우클릭 + 드래그
- **시점 초기화**: 더블클릭

### 인터페이스
- **자동 숨김**: 마우스 정지 3초 후 컨트롤 UI 자동 숨김
- **마우스 움직임**: 컨트롤 UI 다시 표시
- **실시간 상태**: 음악 재생 상태 표시

## 🏗️ 프로젝트 구조

```
src/
├── components/
│   ├── App.js                 # 메인 애플리케이션 컴포넌트
│   ├── Router.js              # 라우팅 설정
│   ├── building/              # 3D 건물 구조 컴포넌트
│   │   ├── makeBuilding.js    # 기본 전시 공간 생성
│   │   ├── makeWall.js        # 벽면 생성
│   │   ├── makeFloor.js       # 바닥 생성
│   │   ├── makeCeil.js        # 천장 생성
│   │   └── makeBulb.js        # 조명 생성
│   ├── camera/
│   │   └── makeCamera.js      # 카메라 설정 및 물리 바디
│   └── seeun/
│       └── makeSeeunBuilding.js # Seeun 전용 전시 공간
├── routes/
│   ├── Home.js                # 기본 전시 공간 (물리 시뮬레이션)
│   └── Seeun.js              # Solace 피아노 시각화 메인
├── music/
│   └── seeun.mp3             # Solace 피아노 음원
├── textures/
│   └── particles/
│       └── 1.png             # 파티클 텍스처
└── styles.css                # 글로벌 스타일
```

## 🎨 시각화 시스템

### 구 시각화 (Sphere Visualizer)
- 단순 입자만으로는 음의 변화를 직관적으로 체험하기 어렵기 때문에, 구 시각화를 더하여 음악에 더 몰입할 수 있도록 함.

- **위치**: 3D 공간 중앙
- **반응**: 음악 주파수에 따른 실시간 크기 변화 및 회전
- **구현**: SphereGeometry를 BufferGeometry로 변환한 입자 구름

### 입자
- 입자는 음악에 영향은 받지만, 영향 받는 것이 눈에 띄지 않음. 
- 잔잔히 부유하며 "Solace(위안)"라는 주제를 시각화함.
- 음악이 끝나면, 기준면으로 가라 앉으며 휴식 후 이완되는 마음을 표현하고자 하였음.

- **수량**: 250개의 동적 입자
- **동작**: 저주파/고주파 분석 기반 위치 및 색상 변화
- **효과**: 음악 정지 시 중력 효과로 자연스러운 정착

### 오디오 분석
- **FFT 크기**: 2048 (주파수 해상도)
- **주파수 분할**: 저주파/고주파 대역 분리 분석
- **실시간 처리**: 60fps 동기화된 비주얼 업데이트

## 📧 연락처

프로젝트에 대한 문의사항이나 제안사항이 있으시면 언제든 연락해 주세요.

---

**Metaverse Exhibition** - 음악과 기술이 만나는 몰입형 경험의 공간
