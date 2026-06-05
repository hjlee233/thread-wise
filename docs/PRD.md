# 커뮤니티 브라우징 보조 AI Chrome Extension 기획서 초안

## 1. 프로젝트 개요

본 프로젝트는 사용자가 커뮤니티 게시글을 읽는 중 별도의 복사, 캡처, 화면 전환 없이 AI에게 게시글 내용을 질문하고, 사실 검증을 요청하며, 댓글 작성 또는 댓글 문장 보완을 받을 수 있도록 지원하는 Chrome Extension 기반 AI 보조 도구이다.

본 도구는 댓글 자동화 봇이 아니다.
AI가 사용자를 대신해 자동으로 댓글을 게시하거나, 여러 게시글에 반복적으로 반응하거나, 여론을 조작하는 기능은 제공하지 않는다.

본 도구의 핵심 목적은 다음과 같다.

```
사용자가 보고 있는 게시글을 AI가 함께 읽는다.
사용자는 게시글에 대해 즉시 질문할 수 있다.
AI는 게시글의 핵심 내용, 쟁점, 사실 검증 포인트를 정리한다.
사용자는 댓글 초안을 추천받거나 자신이 작성한 댓글을 다듬을 수 있다.
최종 게시 여부는 항상 사용자가 직접 판단한다.
```

## 2. 문제 정의

현재 사용자가 커뮤니티 게시글을 보며 ChatGPT에게 도움을 받으려면 다음과 같은 불편이 있다.

```
게시글 전문을 직접 복사해야 한다.
이미지나 캡처를 별도로 첨부해야 한다.
커뮤니티 사이트와 ChatGPT 화면을 오가야 한다.
게시글의 맥락과 댓글 흐름을 매번 설명해야 한다.
사실 검증, 댓글 작성, 문장 수정 과정이 분리되어 있다.
```

이로 인해 사용자는 AI를 활용하고 싶어도 실제 커뮤니티 탐색 흐름 안에서는 사용성이 떨어진다.

## 3. 제품 목표

본 프로젝트의 목표는 다음과 같다.

```
커뮤니티 게시글을 보는 화면에서 바로 AI 보조 기능을 제공한다.
사용자가 선택한 게시글 본문, 선택 문장, 댓글 입력문을 AI 요청 컨텍스트로 활용한다.
게시글 요약, 쟁점 정리, 사실 검증, 댓글 초안 생성, 댓글 다듬기 기능을 제공한다.
OpenAI API Key는 서버에서만 관리하고 Chrome Extension에는 노출하지 않는다.
사용자가 승인하지 않은 자동 전송, 자동 댓글 게시, 계정 자동 조작 기능은 제공하지 않는다.
개인정보와 원문 저장을 최소화한다.
```

## 4. 비목표

다음 기능은 본 프로젝트의 범위에서 제외한다.

```
AI가 자동으로 댓글 게시 버튼을 누르는 기능
여러 게시글을 순회하며 자동으로 댓글을 생성하거나 게시하는 기능
커뮤니티의 비공식 API를 역분석하여 게시하는 기능
로그인 쿠키, 세션, 토큰을 탈취하거나 재사용하는 기능
계정 여러 개를 사용해 여론처럼 보이게 하는 기능
공격적 댓글, 조롱, 혐오, 분쟁 유도 댓글을 강화하는 기능
커뮤니티 운영 정책을 우회하는 기능
```

## 5. 주요 사용자 시나리오

### 5.1 게시글 요약

사용자는 커뮤니티 게시글을 읽는 중 Chrome Extension 사이드패널을 연다.
사용자는 “이 글 요약” 버튼을 누른다.
확장 프로그램은 현재 페이지에서 게시글 제목과 본문을 추출한다.
서버는 OpenAI API를 통해 핵심 내용을 요약한다.
사용자는 사이드패널에서 요약 결과를 확인한다.

### 5.2 게시글에 대한 질문

사용자는 게시글의 특정 문장을 드래그하여 선택한다.
사용자는 사이드패널에서 “이 문장이 무슨 뜻인가요?”라고 질문한다.
확장 프로그램은 선택된 문장과 게시글 전체 맥락을 함께 서버에 전달한다.
AI는 게시글 맥락을 기준으로 답변한다.

### 5.3 사실 검증

사용자는 게시글 내용 중 사실 여부가 의심되는 부분에 대해 “사실 검증”을 요청한다.
AI는 게시글에서 검증 가능한 주장을 분리한다.
필요한 경우 웹 검색 기능을 사용해 외부 출처를 확인한다.
AI는 각 주장에 대해 다음과 같이 분류한다.

```
확인됨
대체로 맞음
불확실
대체로 틀림
틀림
의견 또는 평가
```

### 5.4 댓글 추천

사용자는 게시글에 댓글을 남기고 싶지만 문장을 바로 떠올리지 못한다.
사용자는 댓글 유형을 선택한다.

```
공감형
질문형
정중한 반박형
정보 보충형
중립형
짧은 의견형
```

AI는 댓글 후보를 생성한다.
사용자는 댓글을 복사하거나 댓글 입력창에 삽입한다.
최종 게시 버튼은 사용자가 직접 누른다.

### 5.5 댓글 다듬기

사용자는 댓글 입력창에 초안을 작성한다.
사용자는 “댓글 다듬기”를 누른다.
AI는 사용자의 원문을 기준으로 다음 중 하나의 방식으로 수정한다.

```
더 정중하게
더 짧게
더 설득력 있게
공격성 낮추기
비꼼 제거
맞춤법과 문장 정리
논리 보강
```

AI는 수정본과 변경 이유를 제공한다.

## 6. 기능 요구사항

### 6.1 Chrome Extension

Chrome Extension은 Manifest V3 기준으로 구현한다.

필수 구성 요소는 다음과 같다.

```
manifest.json
content script
background service worker
side panel UI
options page 또는 settings panel
```

### 6.2 Content Script

Content Script는 현재 페이지에서 다음 정보를 추출한다.

```
페이지 URL
페이지 제목
게시글 제목
게시글 본문
사용자가 선택한 텍스트
댓글 입력창의 현재 내용
가능한 경우 기존 댓글 일부
```

사이트마다 DOM 구조가 다르므로, 추출 로직은 사이트별 어댑터 구조로 설계한다.

예상 구조:

```
adapters/
    defaultAdapter.ts
    ruliwebAdapter.ts
    dcinsideAdapter.ts
    clienAdapter.ts
```

검토 필요:

```
1차 MVP에서 지원할 커뮤니티 사이트 범위를 정해야 한다.
사이트별 DOM 변경에 대응하기 위한 fallback 전략이 필요하다.
```

### 6.3 Side Panel UI

Side Panel은 사용자의 주요 조작 화면이다.

필수 기능은 다음과 같다.

```
현재 게시글 분석 버튼
요약 요청 버튼
사실 검증 버튼
질문 입력창
댓글 추천 버튼
댓글 다듬기 버튼
결과 복사 버튼
댓글 입력창에 삽입 버튼
위험도 표시 영역
```

권장 탭 구조:

```
읽기
검증
댓글
다듬기
설정
```

### 6.4 Background Service Worker

Background Service Worker는 다음 역할을 수행한다.

```
현재 탭 정보 관리
content script와 side panel 간 메시지 라우팅
백엔드 API 호출
사용자 설정 저장
요청 상태 관리
오류 처리
```

### 6.5 Backend Server

백엔드는 Node.js Express 기반으로 구현한다.

백엔드의 주요 역할은 다음과 같다.

```
OpenAI API Key 보관
Chrome Extension 요청 검증
OpenAI Responses API 호출
사실 검증 요청 처리
댓글 생성 요청 처리
댓글 수정 요청 처리
Moderation 처리
Rate Limit 적용
로그 최소화
에러 응답 표준화
```

## 7. API 설계 초안

### 7.1 POST /api/analyze

현재 게시글을 분석한다.

Request:

```json
{
  "pageUrl": "https://example.com/post/123",
  "site": "example",
  "title": "게시글 제목",
  "body": "게시글 본문",
  "selectedText": "",
  "comments": []
}
```

Response:

```json
{
  "summary": "게시글 요약",
  "mainPoints": ["핵심 주장 1", "핵심 주장 2"],
  "controversialPoints": ["논쟁 가능 지점"],
  "unknowns": ["확인되지 않은 내용"],
  "recommendedQuestions": ["AI에게 물어볼 만한 질문"]
}
```

### 7.2 POST /api/ask

게시글 맥락을 바탕으로 사용자 질문에 답변한다.

Request:

```json
{
  "context": {
    "pageUrl": "https://example.com/post/123",
    "title": "게시글 제목",
    "body": "게시글 본문",
    "selectedText": "선택된 문장"
  },
  "question": "이 주장이 맞나요?"
}
```

Response:

```json
{
  "answer": "답변 내용",
  "basis": "게시글 내부 근거 또는 추론 근거",
  "needsFactCheck": true,
  "caution": "외부 검증이 필요한 내용입니다."
}
```

### 7.3 POST /api/fact-check

게시글 내 검증 가능한 주장을 확인한다.

Request:

```json
{
  "pageUrl": "https://example.com/post/123",
  "title": "게시글 제목",
  "body": "게시글 본문",
  "selectedText": "검증하고 싶은 문장",
  "userQuestion": "이 내용이 사실인가요?"
}
```

Response:

```json
{
  "summary": "검증 결과 요약",
  "claims": [
    {
      "claim": "검증 대상 주장",
      "verdict": "불확실",
      "reason": "현재 제공된 정보만으로는 단정하기 어렵습니다.",
      "confidence": "medium",
      "sources": []
    }
  ],
  "suggestedComment": "검증 결과를 바탕으로 작성할 수 있는 댓글 초안",
  "caution": "확인되지 않은 내용은 단정하지 않는 것이 좋습니다."
}
```

### 7.4 POST /api/comment/suggest

게시글 맥락을 바탕으로 댓글 초안을 생성한다.

Request:

```json
{
  "context": {
    "pageUrl": "https://example.com/post/123",
    "title": "게시글 제목",
    "body": "게시글 본문",
    "selectedText": ""
  },
  "intent": "정중한 반박",
  "tone": "차분하게",
  "length": "short"
}
```

Response:

```json
{
  "comments": [
    {
      "text": "댓글 초안 1",
      "type": "정중한 반박",
      "riskLevel": "low",
      "note": "상대방을 직접 공격하지 않고 주장에만 반응합니다."
    }
  ],
  "caution": "최종 게시 전 사실관계를 확인하십시오."
}
```

### 7.5 POST /api/comment/rewrite

사용자가 작성한 댓글을 수정한다.

Request:

```json
{
  "context": {
    "pageUrl": "https://example.com/post/123",
    "title": "게시글 제목",
    "body": "게시글 본문"
  },
  "userDraft": "사용자가 작성한 댓글 원문",
  "rewriteMode": "공격성 낮추기"
}
```

Response:

```json
{
  "rewritten": "수정된 댓글",
  "changes": ["표현을 완화했습니다.", "단정적인 문장을 줄였습니다."],
  "riskLevel": "low"
}
```

### 7.6 POST /api/moderate

입력 또는 출력 텍스트의 위험도를 검사한다.

Request:

```json
{
  "text": "검사할 댓글 또는 AI 응답"
}
```

Response:

```json
{
  "riskLevel": "low",
  "flagged": false,
  "categories": [],
  "recommendation": "사용자 검토 후 게시 가능"
}
```

## 8. OpenAI API 사용 방침

본 프로젝트는 OpenAI API를 사용한다.
Chrome Extension에서 OpenAI API Key를 직접 사용하지 않는다.

권장 사용 API:

```
Responses API
Web Search Tool
Structured Outputs
Moderation API
```

### 8.1 Responses API

주요 사용처:

```
게시글 요약
게시글 질문 응답
댓글 추천
댓글 수정
쟁점 정리
주장 추출
```

### 8.2 Web Search Tool

주요 사용처:

```
최신 정보 검증
법률, 정책, 사건, 가격, 일정 등 변동 가능성이 있는 내용 확인
게시글의 사실 주장 검증
```

주의사항:

```
모든 질문에 웹 검색을 사용하지 않는다.
게시글 내부 설명만으로 충분한 경우에는 검색하지 않는다.
사실 검증 결과에는 출처 또는 근거 표시가 필요하다.
```

### 8.3 Structured Outputs

AI 응답은 가능한 한 JSON Schema 기반 구조화 응답으로 받는다.

목적:

```
UI 표시 안정성 확보
댓글 후보 목록 분리
위험도 표시
사실 검증 결과 분류
후속 처리 자동화
```

### 8.4 Moderation API

사용자 입력과 AI 출력에 대해 Moderation을 적용한다.

적용 대상:

```
사용자 질문
사용자 댓글 초안
AI 생성 댓글
AI 수정 댓글
```

처리 정책:

```
low: 그대로 표시
medium: 경고와 함께 표시
high: 댓글 생성 제한 또는 순화 요청
blocked: 표시하지 않거나 안전한 대체 안내 제공
```

## 9. 프롬프트 설계 원칙

### 9.1 공통 시스템 지시문

```text
당신은 사용자가 커뮤니티 게시글을 읽고 이해하도록 돕는 AI 보조 도구입니다.
게시글의 사실과 의견을 구분하십시오.
확인되지 않은 사실은 단정하지 마십시오.
사용자를 대신해 최종 게시하지 않습니다.
상대방을 조롱하거나 공격하는 댓글을 작성하지 마십시오.
혐오, 괴롭힘, 개인정보 노출, 불법행위 조장 표현은 피하십시오.
댓글은 사용자가 직접 검토할 수 있는 초안으로만 작성하십시오.
```

### 9.2 사실 검증 지시문

```text
게시글에서 검증 가능한 주장만 분리하십시오.
감상, 의견, 추측은 사실 검증 대상에서 제외하거나 '의견/평가'로 분류하십시오.
외부 확인이 필요한 경우 검색 결과를 바탕으로 판단하십시오.
근거가 부족하면 '불확실'로 분류하십시오.
단정적인 표현을 피하고 신뢰도를 함께 제시하십시오.
```

### 9.3 댓글 생성 지시문

```text
게시글의 맥락을 왜곡하지 마십시오.
게시글에 없는 사실을 만들어 넣지 마십시오.
사용자가 선택한 댓글 목적과 문체를 따르십시오.
공격적 표현, 비꼼, 조롱, 집단 일반화를 피하십시오.
최종 댓글은 사용자가 직접 수정할 수 있는 초안으로 작성하십시오.
```

## 10. 데이터 처리 정책

본 프로젝트는 커뮤니티 게시글과 사용자 댓글을 다루므로 데이터 최소 수집 원칙을 따른다.

기본 원칙:

```
사용자가 요청 버튼을 누르기 전에는 원문을 서버로 전송하지 않는다.
서버는 게시글 원문을 DB에 저장하지 않는다.
로그에는 원문을 남기지 않는다.
URL, 사이트명, 요청 유형, 토큰 사용량, 에러 코드 정도만 저장한다.
닉네임, 이메일, 전화번호 등 개인정보로 보이는 문자열은 가능한 경우 마스킹한다.
사용자가 원할 경우 로컬 기록 삭제 기능을 제공한다.
```

검토 필요:

```
로컬 저장 범위
서버 로그 보관 기간
사용자 설정 동기화 여부
민감 사이트에서 자동 비활성화할지 여부
```

## 11. 보안 요구사항

```
OpenAI API Key는 서버 환경변수로만 관리한다.
Chrome Extension 코드에 API Key를 포함하지 않는다.
백엔드 API에는 인증 또는 최소한의 사용 제한을 적용한다.
요청 크기 제한을 둔다.
사이트 URL allowlist 또는 blocklist를 검토한다.
CORS 정책을 제한한다.
Rate Limit을 적용한다.
서버 로그에 원문 본문과 댓글 내용을 남기지 않는다.
HTTPS 환경을 전제로 한다.
```

## 12. 안전성 요구사항

```
AI가 자동으로 게시 버튼을 누르지 않는다.
사용자의 명시적 요청 없이 페이지 내용을 서버로 보내지 않는다.
생성된 댓글은 항상 초안으로만 제공한다.
댓글 입력창 삽입은 가능하지만 최종 게시는 사용자가 직접 수행한다.
공격적 댓글은 순화하거나 생성하지 않는다.
사실 검증이 필요한 내용은 단정하지 않는다.
명예훼손, 개인정보 노출, 혐오, 괴롭힘 가능성이 있는 표현은 경고한다.
```

## 13. MVP 범위

### 13.1 1차 MVP

목표: 현재 페이지를 읽고 AI에게 질문할 수 있는 최소 기능 구현

포함 기능:

```
Chrome Extension Side Panel
현재 게시글 제목/본문 추출
선택 텍스트 추출
게시글 요약
게시글에 대한 질문 응답
Node.js Express 백엔드
OpenAI Responses API 연동
API Key 서버 보관
```

제외 기능:

```
댓글 입력창 자동 삽입
사실 검증용 웹 검색
사이트별 정교한 DOM 어댑터
사용자 계정 시스템
기록 저장
```

### 13.2 2차 MVP

목표: 사실 검증과 출처 기반 응답 추가

포함 기능:

```
검증 가능한 주장 추출
Web Search Tool 연동
검증 결과 구조화
출처 표시
불확실성 표시
```

### 13.3 3차 MVP

목표: 댓글 작성 보조 기능 추가

포함 기능:

```
댓글 추천
댓글 다듬기
댓글 위험도 검사
댓글 복사
댓글 입력창 삽입
```

제외 기능:

```
자동 게시
반복 댓글 생성
다중 계정 지원
```

## 14. 추천 디렉터리 구조

```text
community-ai-copilot/
    README.md
    docs/
        PRD.md
        ARCHITECTURE.md
        SECURITY.md
        API_SPEC.md
        PROMPTS.md
    extension/
        manifest.json
        src/
            background/
                serviceWorker.ts
            content/
                index.ts
                adapters/
                    defaultAdapter.ts
                    ruliwebAdapter.ts
            sidepanel/
                App.tsx
                components/
                pages/
            shared/
                types.ts
                messages.ts
    server/
        src/
            app.ts
            routes/
                analyze.ts
                ask.ts
                factCheck.ts
                comment.ts
                moderate.ts
            services/
                openaiClient.ts
                moderationService.ts
                promptService.ts
                privacyService.ts
            middleware/
                rateLimit.ts
                errorHandler.ts
            schemas/
                analyze.schema.ts
                factCheck.schema.ts
                comment.schema.ts
        .env.example
        package.json
    package.json
```

## 15. 기술 스택 제안

Chrome Extension:

```
Manifest V3
TypeScript
React
Vite
Chrome Side Panel API
Chrome Storage API
```

Backend:

```
Node.js
Express
TypeScript
OpenAI SDK
Zod
dotenv
express-rate-limit
```

개발 환경:

```
Windows 기준
Node.js LTS
npm 또는 pnpm
GitHub 저장소 관리
```

검토 필요:

```
pnpm workspace 적용 여부
extension과 server를 monorepo로 관리할지 여부
배포 서버 환경
사용자 인증 적용 여부
```

## 16. Codex 검토 요청 사항

Codex는 본 기획서를 기준으로 다음을 검토한다.

```
요구사항이 구현 가능한 단위로 분리되어 있는지 검토한다.
Chrome Extension Manifest V3 기준으로 구조가 적절한지 검토한다.
content script, background service worker, side panel 간 메시지 구조를 제안한다.
Node.js Express 백엔드 API 구조를 구체화한다.
OpenAI Responses API 호출부의 추상화 방식을 제안한다.
Structured Outputs용 JSON Schema를 보완한다.
개인정보 최소 수집과 로그 마스킹 방식을 제안한다.
MVP 1차 구현 태스크를 작은 작업 단위로 분해한다.
자동 게시 기능이 포함되지 않도록 안전장치를 점검한다.
커뮤니티별 DOM 어댑터 구조를 확장 가능하게 설계한다.
```

## 17. Codex에게 전달할 작업 지시문 예시

```text
이 저장소는 커뮤니티 게시글을 읽고 사용자가 AI와 함께 요약, 질문, 사실 검증, 댓글 초안 작성, 댓글 다듬기를 수행할 수 있는 Chrome Extension + Node.js 백엔드 프로젝트입니다.

docs/PRD.md의 내용을 기준으로 다음 작업을 수행해 주세요.

1. 전체 아키텍처를 검토하고 docs/ARCHITECTURE.md 초안을 작성해 주세요.
2. Manifest V3 기반 Chrome Extension 구조를 제안해 주세요.
3. extension과 server의 초기 디렉터리 구조를 생성해 주세요.
4. 1차 MVP 범위에 맞춰 구현 태스크를 TODO 목록으로 분해해 주세요.
5. OpenAI API Key가 extension에 노출되지 않도록 server 경유 구조를 유지해 주세요.
6. 자동 댓글 게시 기능은 구현하지 말고, 초안 생성과 사용자 검토 흐름만 구현 대상으로 삼아 주세요.
7. TypeScript 기준으로 타입 정의와 API 스키마를 먼저 작성해 주세요.
```

## 18. 성공 기준

1차 MVP 성공 기준:

```
사용자가 커뮤니티 게시글에서 사이드패널을 열 수 있다.
현재 게시글 제목과 본문을 추출할 수 있다.
사용자가 선택한 문장을 AI 질문에 포함할 수 있다.
게시글 요약 결과를 받을 수 있다.
게시글에 대한 질문 응답을 받을 수 있다.
OpenAI API Key가 extension에 노출되지 않는다.
사용자가 요청하기 전에는 게시글 원문을 서버로 보내지 않는다.
```

2차 MVP 성공 기준:

```
게시글 내 검증 가능한 주장을 분리할 수 있다.
외부 검색이 필요한 내용을 구분할 수 있다.
사실 검증 결과를 신뢰도와 함께 표시할 수 있다.
```

3차 MVP 성공 기준:

```
댓글 초안을 생성할 수 있다.
사용자가 작성한 댓글을 다듬을 수 있다.
위험한 표현을 감지하고 경고할 수 있다.
댓글 입력창에 초안을 삽입할 수 있다.
최종 게시는 사용자가 직접 수행한다.
```

## 19. 핵심 설계 원칙

```
AI는 사용자가 보는 글을 함께 읽는 보조자이다.
AI는 사용자를 대신해 커뮤니티 활동을 자동 수행하지 않는다.
사실과 의견을 구분한다.
확인되지 않은 내용은 단정하지 않는다.
댓글은 초안으로만 제공한다.
최종 판단과 게시 책임은 사용자에게 있다.
API Key는 서버에만 둔다.
원문 저장은 최소화한다.
사용자의 명시적 요청이 있을 때만 AI 분석을 수행한다.
```
