# Thread Wise Server (1차 MVP)

커뮤니티 게시글 **요약**과 **질문 응답**을 제공하는 백엔드. OpenAI API Key 는 서버에서만 보관하며, Chrome Extension 은 이 서버 API 만 호출한다.

관련 문서: [PRD](../docs/PRD.md) · [API 명세](../docs/API_SPEC.md) · [아키텍처](../docs/ARCHITECTURE.md) · [MVP 1 계획](../docs/MVP_1_PLAN.md)

## 요구 사항

- Node.js 20 이상 (개발 환경 기준 v24)
- OpenAI API Key

## 설치

```bash
npm install
```

## 환경변수 설정

`.env.example` 를 복사해 `.env` 를 만들고 값을 채운다. `.env` 는 커밋하지 않는다.

```bash
cp .env.example .env
```

| 변수 | 설명 | 기본값 |
| --- | --- | --- |
| `OPENAI_API_KEY` | OpenAI API Key (**필수**). 서버에서만 사용 | – |
| `OPENAI_MODEL` | Responses API + Structured Outputs 지원 모델 | `gpt-4.1-mini` |
| `OPENAI_TIMEOUT_MS` | OpenAI 요청 타임아웃(ms) | `30000` |
| `PORT` | 서버 포트 | `3000` |
| `NODE_ENV` | 실행 환경 | `development` |
| `MAX_BODY_CHARS` | 게시글 본문 최대 길이(문자). 초과분은 잘라내고 경고 | `12000` |
| `CORS_ALLOWED_ORIGINS` | 허용 Origin(콤마 구분). 비우면 모두 허용 | (비어 있음) |

## 실행

개발(파일 변경 감지):

```bash
npm run dev
```

빌드 후 실행:

```bash
npm run build
npm start
```

타입 체크만:

```bash
npm run typecheck
```

## API 요약

전체 계약은 [API_SPEC.md](../docs/API_SPEC.md) 참고.

### `GET /health`

```bash
curl http://localhost:3000/health
# {"ok":true,"service":"thread-wise-server","version":"0.1.0"}
```

### `POST /api/analyze` — 게시글 요약

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H 'Content-Type: application/json' \
  -d '{
    "pageUrl": "https://example.com/post/123",
    "site": "default",
    "title": "게시글 제목",
    "body": "게시글 본문..."
  }'
```

응답: `summary`, `mainPoints[]`, `unknowns[]`, `recommendedQuestions[]`, `caution`, `warnings[]`

### `POST /api/ask` — 게시글 기반 질문 응답

```bash
curl -X POST http://localhost:3000/api/ask \
  -H 'Content-Type: application/json' \
  -d '{
    "context": {
      "pageUrl": "https://example.com/post/123",
      "title": "게시글 제목",
      "body": "게시글 본문...",
      "selectedText": "선택한 문장"
    },
    "question": "이 문장이 무슨 뜻인가요?"
  }'
```

응답: `answer`, `basis`, `needsFactCheck`, `caution`, `warnings[]`

> 1차 MVP 에서는 외부 웹 검색을 수행하지 않는다. 외부 확인이 필요한 경우 `needsFactCheck: true` 로 표시한다.

## 공통 정책

- **요청 크기 제한**: 100kb 초과 시 `413 PAYLOAD_TOO_LARGE`
- **Rate Limit**: 15분당 60회 초과 시 `429 RATE_LIMITED` (`/api/*` 에 적용)
- **에러 형식**: 모든 오류는 `{ "error": { code, message, requestId, details } }`
  - 코드: `VALIDATION_ERROR` `PAYLOAD_TOO_LARGE` `RATE_LIMITED` `OPENAI_ERROR` `OPENAI_TIMEOUT` `EMPTY_CONTEXT` `UNSUPPORTED_ORIGIN` `INTERNAL_ERROR`

## 개인정보 / 로깅

- DB 를 사용하지 않는다. 원문을 저장하지 않는다.
- 로그에는 게시글 본문·선택 텍스트·질문 원문·OpenAI 응답 전문·API Key 를 **남기지 않는다**.
- 로그에 남기는 값: `requestId`, `method`, `path`, `statusCode`, `latencyMs`, `site`, `bodyLength`, `errorCode`.

## 디렉터리 구조

```text
server/
  src/
    server.ts            # 엔트리포인트
    app.ts               # Express 앱 조립
    config.ts            # 환경변수 로딩/검증
    errors.ts            # AppError
    routes/              # health, analyze, ask
    schemas/             # Zod 요청 스키마 + OpenAI 구조화 출력 스키마
    services/            # openaiClient, promptService, postAnalysisService, privacyService
    middleware/          # requestId, requestLogger, rateLimit, errorHandler, asyncHandler
    types/api.ts         # 공통 API 타입
```
