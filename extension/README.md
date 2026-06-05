# Thread Wise Extension (1차 MVP)

커뮤니티 게시글을 함께 읽는 AI 보조 도구의 Chrome Extension (Manifest V3).

관련 문서: [PRD](../docs/PRD.md) · [아키텍처](../docs/ARCHITECTURE.md) · [MVP 1 계획](../docs/MVP_1_PLAN.md)

## 현재 상태: M3 (골격)

이 단계에서 구현된 것:

- Manifest V3 + Vite + React + TypeScript 빌드
- Side Panel UI 골격
- Background Service Worker (툴바 클릭 시 Side Panel 열기, PING/PONG 연결 확인)
- Content Script 엔트리 (로드 로그)
- Side Panel ↔ Background 메시지 통신

다음 단계:

- **M4**: 현재 탭 컨텍스트 추출(제목/본문/선택 텍스트) → Side Panel 표시
- **M5**: 백엔드 `/api/analyze`·`/api/ask` 연결 (요약/질문)

## 요구 사항

- Node.js 20 이상
- Chrome (또는 Chromium 계열)

## 설치 / 빌드

```bash
npm install
npm run build      # dist/ 에 unpacked extension 생성
```

개발 모드(HMR):

```bash
npm run dev
```

타입 체크:

```bash
npm run typecheck
```

## Chrome 에 로드하기 (unpacked)

1. `npm run build` 실행 → `extension/dist/` 생성
2. Chrome 에서 `chrome://extensions` 열기
3. 우측 상단 **개발자 모드** 켜기
4. **압축해제된 확장 프로그램을 로드합니다** 클릭
5. `extension/dist` 폴더 선택
6. 툴바의 Thread Wise 아이콘 클릭 → Side Panel 이 열린다

## 동작 확인 (M3 완료 기준)

- [ ] `chrome://extensions` 에서 오류 없이 로드된다
- [ ] 툴바 아이콘 클릭 시 Side Panel 이 열린다
- [ ] Side Panel 에 기본 UI(제목, 카드)가 표시된다
- [ ] **Background 연결 확인** 버튼 클릭 → `✓ Background 연결됨 · v0.1.0` 표시
  - 이것으로 Side Panel ↔ Background 메시지 통신을 확인한다

## 구조

```text
extension/
  manifest.config.ts   # Manifest V3 정의 (crxjs defineManifest)
  vite.config.ts       # Vite + React + crxjs
  src/
    background/
      serviceWorker.ts  # Side Panel 열기, PING/PONG (M4·M5 에서 라우팅/API 중계 확장)
    content/
      index.ts          # 컨텍스트 추출 진입점 (M4 에서 구현)
    sidepanel/
      index.html
      main.tsx
      App.tsx           # 읽기 화면 골격 + 연결 확인
      styles.css
    shared/
      messages.ts       # 메시지 계약 + sendToBackground
      types.ts          # PageContext / API 응답 타입
      constants.ts      # 서버 Base URL 등
```

## 비고

- OpenAI API Key 는 Extension 에 저장하지 않는다. 모든 AI 호출은 백엔드 서버를 경유한다.
- 자동 댓글 게시 기능은 어떤 단계에서도 구현하지 않는다.
