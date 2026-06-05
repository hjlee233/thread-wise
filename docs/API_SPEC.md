# Thread Wise API Specification

이 문서는 1차 MVP에서 Chrome Extension과 백엔드 서버가 주고받는 API 계약을 정의한다.

1차 MVP의 API 범위는 게시글 요약과 게시글 기반 질문 응답으로 제한한다. 사실 검증용 웹 검색, 댓글 추천, 댓글 다듬기, 댓글 입력창 삽입은 후속 MVP 범위이다.

## 1. 설계 원칙

```text
OpenAI API Key는 서버에만 둔다.
Extension은 백엔드 API만 호출한다.
사용자가 명시적으로 버튼을 누르기 전에는 원문을 서버로 보내지 않는다.
서버는 게시글 본문, 선택 텍스트, 사용자 질문 원문을 로그에 남기지 않는다.
모든 API 응답은 UI가 안정적으로 처리할 수 있는 구조화된 JSON으로 반환한다.
```

## 2. Base URL

개발 환경 기본값:

```text
http://localhost:3000
```

Extension은 서버 주소를 설정값으로 보관할 수 있다. 1차 MVP에서는 기본값을 localhost로 두고, 이후 배포 환경에서 설정 UI 또는 빌드 환경변수로 분리한다.

## 3. 공통 정책

### 3.1 Content-Type

Request:

```http
Content-Type: application/json
```

Response:

```http
Content-Type: application/json
```

### 3.2 Request Size Limit

1차 MVP 권장 제한:

```text
100kb
```

초과 시 서버는 `413 PAYLOAD_TOO_LARGE`를 반환한다.

### 3.3 Rate Limit

개발 기본값:

```text
15분당 60회
```

초과 시 서버는 `429 RATE_LIMITED`를 반환한다.

### 3.4 Logging

서버 로그에 남길 수 있는 값:

```text
requestId
method
path
statusCode
latencyMs
site
bodyLength
errorCode
```

서버 로그에 남기면 안 되는 값:

```text
게시글 본문
선택 텍스트
사용자 질문 원문
OpenAI 응답 전문
OpenAI API Key
쿠키, 세션, 인증 토큰
```

## 4. 공통 타입

### 4.1 PageContext

Extension의 content script가 추출하고, API 요청에 포함하는 페이지 컨텍스트이다.

```json
{
  "pageUrl": "https://example.com/post/123",
  "pageTitle": "브라우저 탭 제목",
  "site": "default",
  "postTitle": "게시글 제목",
  "body": "게시글 본문",
  "selectedText": "사용자가 드래그한 텍스트",
  "extractionMethod": "default",
  "extractionWarnings": []
}
```

필드:

```text
pageUrl: 현재 탭 URL
pageTitle: document.title
site: 어댑터가 식별한 사이트 ID. 1차 MVP 기본값은 default
postTitle: 게시글 제목 후보
body: 게시글 본문 후보
selectedText: 사용자가 선택한 텍스트. 없으면 빈 문자열
extractionMethod: default | selection-only | manual
extractionWarnings: 본문 추출 품질 관련 경고 목록
```

### 4.2 ErrorResponse

모든 에러 응답은 다음 형식을 따른다.

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "요청 형식이 올바르지 않습니다.",
    "requestId": "req_abc123",
    "details": []
  }
}
```

`details`는 개발 중 디버깅을 돕기 위한 제한된 구조화 정보만 포함한다. 원문 본문이나 질문 내용은 포함하지 않는다.

공통 에러 코드:

```text
VALIDATION_ERROR
PAYLOAD_TOO_LARGE
RATE_LIMITED
OPENAI_ERROR
OPENAI_TIMEOUT
EMPTY_CONTEXT
UNSUPPORTED_ORIGIN
INTERNAL_ERROR
```

## 5. GET /health

서버 상태 확인용 엔드포인트이다.

### Response 200

```json
{
  "ok": true,
  "service": "thread-wise-server",
  "version": "0.1.0"
}
```

## 6. POST /api/analyze

현재 게시글을 요약하고 핵심 내용을 구조화한다.

### Request

```json
{
  "pageUrl": "https://example.com/post/123",
  "site": "default",
  "title": "게시글 제목",
  "body": "게시글 본문",
  "selectedText": ""
}
```

Validation:

```text
pageUrl: 필수, URL 문자열
site: 필수, 1자 이상 80자 이하
title: 선택, 최대 500자
body: 필수, 1자 이상
selectedText: 선택, 최대 5000자
```

본문 길이는 서버에서 토큰 비용과 응답 품질을 고려해 잘라낼 수 있다. 잘라낸 경우 응답의 `caution` 또는 `warnings`에 표시한다.

### Response 200

```json
{
  "summary": "게시글 핵심 요약",
  "mainPoints": [
    "핵심 내용 1",
    "핵심 내용 2"
  ],
  "unknowns": [
    "게시글만으로 확인되지 않는 내용"
  ],
  "recommendedQuestions": [
    "이 주장에 근거가 있나요?",
    "글쓴이가 전제하고 있는 내용은 무엇인가요?"
  ],
  "caution": "게시글 내부 내용만 바탕으로 요약했습니다.",
  "warnings": []
}
```

응답 필드:

```text
summary: 1차 요약
mainPoints: 게시글의 핵심 주장 또는 정보
unknowns: 게시글만으로 확인되지 않는 내용
recommendedQuestions: 사용자가 이어서 물어볼 만한 질문
caution: 제한 사항 안내
warnings: 서버 처리 중 발생한 비치명 경고
```

## 7. POST /api/ask

게시글 컨텍스트와 사용자의 질문을 바탕으로 답변한다.

1차 MVP에서는 외부 웹 검색을 수행하지 않는다. 최신 정보, 법률, 가격, 일정, 사건 등 외부 확인이 필요한 경우 `needsFactCheck`를 `true`로 반환한다.

### Request

```json
{
  "context": {
    "pageUrl": "https://example.com/post/123",
    "title": "게시글 제목",
    "body": "게시글 본문",
    "selectedText": "선택된 문장"
  },
  "question": "이 문장이 무슨 뜻인가요?"
}
```

Validation:

```text
context.pageUrl: 필수, URL 문자열
context.title: 선택, 최대 500자
context.body: 필수, 1자 이상
context.selectedText: 선택, 최대 5000자
question: 필수, 1자 이상 2000자 이하
```

### Response 200

```json
{
  "answer": "질문에 대한 답변",
  "basis": "게시글 내부에서 사용한 근거 또는 추론 근거",
  "needsFactCheck": false,
  "caution": "외부 검색은 수행하지 않았습니다.",
  "warnings": []
}
```

응답 필드:

```text
answer: 사용자 질문에 대한 답변
basis: 게시글 내부 근거, 선택 텍스트, 또는 추론 기준
needsFactCheck: 외부 출처 확인이 필요한지 여부
caution: 답변 제한 사항
warnings: 서버 처리 중 발생한 비치명 경고
```

## 8. OpenAI Structured Output

서버는 OpenAI 응답을 가능한 한 JSON Schema 형태로 강제한다.

`/api/analyze` 응답 스키마 초안:

```json
{
  "type": "object",
  "additionalProperties": false,
  "required": ["summary", "mainPoints", "unknowns", "recommendedQuestions", "caution", "warnings"],
  "properties": {
    "summary": { "type": "string" },
    "mainPoints": { "type": "array", "items": { "type": "string" } },
    "unknowns": { "type": "array", "items": { "type": "string" } },
    "recommendedQuestions": { "type": "array", "items": { "type": "string" } },
    "caution": { "type": "string" },
    "warnings": { "type": "array", "items": { "type": "string" } }
  }
}
```

`/api/ask` 응답 스키마 초안:

```json
{
  "type": "object",
  "additionalProperties": false,
  "required": ["answer", "basis", "needsFactCheck", "caution", "warnings"],
  "properties": {
    "answer": { "type": "string" },
    "basis": { "type": "string" },
    "needsFactCheck": { "type": "boolean" },
    "caution": { "type": "string" },
    "warnings": { "type": "array", "items": { "type": "string" } }
  }
}
```

## 9. 후속 MVP에서 추가할 API

2차 MVP:

```text
POST /api/fact-check
```

3차 MVP:

```text
POST /api/comment/suggest
POST /api/comment/rewrite
POST /api/moderate
```

1차 MVP 구현 중 위 엔드포인트의 파일이나 UI를 미리 만들지 않는다. 단, 타입과 서비스 구조는 후속 확장이 가능하도록 경계를 둔다.
