# Thread Wise Extension (1차 MVP)

커뮤니티 게시글을 함께 읽는 AI 보조 도구의 Chrome Extension (Manifest V3).

관련 문서: [PRD](../docs/PRD.md) · [아키텍처](../docs/ARCHITECTURE.md) · [MVP 1 계획](../docs/MVP_1_PLAN.md)

## 현재 상태: M5 (요약/질문 End-to-End) — 1차 MVP 완성

구현된 것:

- Manifest V3 + Vite + React + TypeScript 빌드
- Side Panel UI
  - **현재 글 가져오기** → 컨텍스트 미리보기(제목/URL/본문/선택 텍스트/경고)
  - **요약하기** → 요약·핵심·미확인·추천질문·주의 표시
  - **질문하기** → 답변·근거·외부확인 배지·주의 표시
- Background Service Worker
  - Side Panel 열기, 활성 탭 컨텍스트 추출 중계
  - **API client**: `/api/analyze`·`/api/ask` 호출 중계 (Side Panel 은 서버를 직접 호출하지 않음)
- Content Script + PageAdapter 기반 추출 (`defaultAdapter`, `ruliwebAdapter`)
- 오류 처리: 서버 미실행(NETWORK) / 타임아웃 / rate limit / 요청 크기 초과 / 서버 ErrorResponse

> 원문은 **사용자가 버튼을 누를 때만** 서버로 전송된다. 추출(현재 글 가져오기) 단계에서는 전송하지 않는다.

다음 단계:

- **2차 MVP**: 사실 검증(`/api/fact-check` + Web Search Tool)

### 서버 연결

- 기본 서버 주소: `http://localhost:3000` ([constants.ts](src/shared/constants.ts) `DEFAULT_SERVER_BASE_URL`)
- 요약/질문을 쓰려면 [server](../server/) 가 실행 중이어야 한다 (`cd server && npm run dev`).
- OpenAI API Key 는 **서버 `.env`** 에만 둔다. Extension 번들에는 포함되지 않는다.

### 사이트 어댑터

`src/content/adapters/` 에서 사이트별 추출 전략을 관리한다. `adapterRegistry` 가
URL 에 맞는 어댑터를 고르고, 항상 `defaultAdapter` 로 fallback 한다.

| 어댑터 | 매칭 | 본문 추출 1순위 |
| --- | --- | --- |
| `ruliwebAdapter` | `bbs.ruliweb.com/community/board/*/read/*` | JSON-LD `DiscussionForumPosting.articleBody` → DOM fallback |
| `defaultAdapter` | 그 외 모든 페이지 | `article`→`main`→`[role=main]`→가장 긴 텍스트 블록 |

> 댓글은 1차 MVP 범위 밖이라 본문에 포함하지 않는다. 루리웹 댓글 선택자 메모는
> [ruliwebAdapter.ts](src/content/adapters/ruliwebAdapter.ts) 상단 주석에 보존되어 있다(후속 확장용).

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

## 동작 확인 (1차 MVP 완료 기준)

서버를 먼저 실행한다 (`cd ../server && npm run dev`).

- [ ] `chrome://extensions` 에서 오류 없이 로드된다
- [ ] 툴바 아이콘 클릭 시 Side Panel 이 열린다
- [ ] 게시글 페이지에서 **현재 글 가져오기** → 제목/본문 미리보기 표시
- [ ] 본문 일부를 드래그 후 다시 가져오면 **선택 텍스트** 표시
- [ ] **요약하기** → 요약/핵심/추천질문 표시
- [ ] **질문하기** → 답변/근거 표시
- [ ] 서버를 끈 채 요약 시도 → `서버에 연결할 수 없습니다 … (NETWORK)` 오류 표시

## 구조

```text
extension/
  manifest.config.ts   # Manifest V3 정의 (crxjs defineManifest)
  vite.config.ts       # Vite + React + crxjs
  src/
    background/
      serviceWorker.ts  # Side Panel 열기, 메시지 라우팅(추출/요약/질문)
      tabContext.ts     # 활성 탭 조회 + content script 추출 중계
      apiClient.ts      # 서버 /api/analyze·/api/ask 호출
    content/
      index.ts          # 추출 요청 수신 핸들러
      adapters/
        types.ts            # PageAdapter 인터페이스
        defaultAdapter.ts   # 범용 추출 + 재사용 텍스트 헬퍼
        ruliwebAdapter.ts   # 루리웹 JSON-LD 추출
        adapterRegistry.ts  # URL 기반 어댑터 선택
    sidepanel/
      index.html
      main.tsx
      App.tsx           # 읽기/요약/질문 화면
      components/
        ContextPreview.tsx  # 추출 컨텍스트 미리보기
        ResultPanel.tsx     # 요약/답변 결과 표시
      styles.css
    shared/
      messages.ts       # 메시지 계약 + sendToBackground
      types.ts          # PageContext / API 응답 타입
      constants.ts      # 서버 Base URL 등
```

## 비고

- OpenAI API Key 는 Extension 에 저장하지 않는다. 모든 AI 호출은 백엔드 서버를 경유한다.
- 자동 댓글 게시 기능은 어떤 단계에서도 구현하지 않는다.
