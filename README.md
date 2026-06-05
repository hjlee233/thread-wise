# Thread Wise

커뮤니티 게시글을 **함께 읽는 AI 보조 도구**. 사용자가 보고 있는 게시글을 복사·캡처·화면 전환 없이
AI에게 **요약**시키고 **질문**할 수 있는 Chrome Extension(Manifest V3) + Node.js 백엔드입니다.

> 댓글 자동화 봇이 아닙니다. 자동 게시·여론 조작 기능은 제공하지 않으며, 최종 판단과 게시는 항상 사용자가 합니다.

## 구성

| 디렉터리 | 설명 |
| --- | --- |
| [`server/`](server/) | Node.js + Express 백엔드. OpenAI 호출, 요약/질문 API. **API Key 는 여기에만 보관.** |
| [`extension/`](extension/) | Manifest V3 Chrome Extension. Side Panel UI, 본문 추출, 서버 호출. |
| [`docs/`](docs/) | 기획·설계 문서 (PRD, API_SPEC, ARCHITECTURE, MVP_1_PLAN, HYBRID_AI_PLAN). |

## 현재 상태: 1차 MVP 완성

게시글 본문/선택 텍스트를 추출해 **요약**과 **질문 응답**을 제공한다.

- ✅ 현재 글 가져오기(제목·본문·선택 텍스트 추출, 루리웹 JSON-LD 어댑터 포함)
- ✅ 요약하기 / 질문하기 (서버 경유 OpenAI Responses API + Structured Outputs)
- ✅ OpenAI API Key 서버 전용 보관, 원문 로그 미기록, 사용자 요청 시에만 전송
- ⏳ 사실 검증(2차), 댓글 추천/다듬기(3차)는 범위 밖

## 빠른 시작 (Windows / Node.js 20+)

### 1. 백엔드 실행

```bash
cd server
npm install
copy .env.example .env       # 또는: cp .env.example .env
# .env 를 열어 OPENAI_API_KEY 를 채운다
npm run dev                  # http://localhost:3000
```

확인:

```bash
curl http://localhost:3000/health
# {"ok":true,"service":"thread-wise-server","version":"0.1.0"}
```

### 2. 확장 프로그램 빌드 & 로드

```bash
cd extension
npm install
npm run build                # extension/dist 생성
```

1. Chrome `chrome://extensions` → **개발자 모드** ON
2. **압축해제된 확장 프로그램을 로드합니다** → `extension/dist` 선택
3. 게시글 페이지(예: 루리웹)에서 툴바의 Thread Wise 아이콘 클릭 → Side Panel 열림
4. **현재 글 가져오기 → 요약하기 / 질문하기**

> 코드를 수정하면 `npm run build` 후 `chrome://extensions` 에서 확장을 **새로고침**하고,
> 대상 페이지도 새로고침한다(content script 재주입).

## 보안 / 개인정보 원칙

- OpenAI API Key 는 서버 환경변수(`.env`)로만 관리하며 Extension 에 포함하지 않는다.
- 서버는 게시글 본문·선택 텍스트·질문 원문·OpenAI 응답 전문을 **로그에 남기지 않는다**(메타데이터만).
- DB 를 사용하지 않으며 원문을 저장하지 않는다.
- production 에서는 `CORS_ALLOWED_ORIGINS` 를 반드시 설정해야 기동된다(보안 가드).

## 더 보기

- 서버 상세: [server/README.md](server/README.md)
- 확장 상세: [extension/README.md](extension/README.md)
- API 계약: [docs/API_SPEC.md](docs/API_SPEC.md) · 아키텍처: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- 하이브리드 AI 계획: [docs/HYBRID_AI_PLAN.md](docs/HYBRID_AI_PLAN.md)
