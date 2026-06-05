# Thread Wise 1차 MVP Development Plan

이 문서는 1차 MVP의 개발 범위, 작업 순서, 완료 기준을 정의한다.

## 1. MVP 목표

1차 MVP의 목표는 사용자가 현재 보고 있는 페이지의 게시글 내용을 Chrome Side Panel에서 가져오고, 그 내용을 바탕으로 AI 요약과 질문 응답을 받을 수 있게 하는 것이다.

핵심 사용자 흐름:

```text
사용자가 게시글 페이지를 연다.
Side Panel을 연다.
현재 글 가져오기를 누른다.
추출된 제목, 본문 미리보기, 선택 텍스트를 확인한다.
요약하기 또는 질문하기를 누른다.
서버가 OpenAI API를 호출한다.
Side Panel에 구조화된 결과가 표시된다.
```

## 2. 포함 범위

1차 MVP 포함 기능:

```text
Chrome Extension Manifest V3
Chrome Side Panel UI
Content Script 기반 현재 페이지 컨텍스트 추출
defaultAdapter 기반 게시글 제목/본문 추출
선택 텍스트 추출
Background Service Worker 메시지 라우팅
Node.js Express 백엔드
GET /health
POST /api/analyze
POST /api/ask
OpenAI Responses API 서버 연동
Structured Outputs 기반 응답
서버 API Key 보관
요청 전 원문 미전송
서버 로그 원문 제외
기본 rate limit과 request size limit
```

## 3. 제외 범위

1차 MVP 제외 기능:

```text
사실 검증용 웹 검색
출처 기반 검증 결과
댓글 추천
댓글 다듬기
댓글 위험도 검사
댓글 입력창 자동 삽입
기존 댓글 추출
사이트별 정교한 DOM 어댑터
사용자 계정 시스템
DB 저장
사용 기록 저장
자동 게시
반복 댓글 생성
다중 계정 지원
```

## 4. 주요 리스크와 대응

### 4.1 게시글 본문 추출 품질

리스크:

```text
커뮤니티마다 DOM 구조가 달라 defaultAdapter만으로 본문을 안정적으로 추출하기 어렵다.
광고, 댓글, 추천글, 네비게이션이 본문에 섞일 수 있다.
```

대응:

```text
1차에서는 완벽 추출보다 실패를 명확히 드러내는 UX를 우선한다.
extractionWarnings를 표시한다.
본문이 너무 짧으면 선택 텍스트 기반 질문 또는 수동 입력 fallback을 제공할 수 있게 구조를 둔다.
사이트별 어댑터는 2차 이후 사용량이 많은 사이트부터 추가한다.
```

### 4.2 Side Panel 기능 과다

리스크:

```text
PRD의 Side Panel 필수 기능에는 2차/3차 기능이 섞여 있다.
초기 UI가 커지면 요약/질문 흐름 검증이 늦어진다.
```

대응:

```text
1차 Side Panel은 읽기 화면 하나만 만든다.
검증, 댓글, 다듬기 탭은 구현하지 않는다.
```

### 4.3 백엔드 남용

리스크:

```text
API Key를 서버에 숨겨도 공개 서버 API가 남용될 수 있다.
```

대응:

```text
1차는 개발 서버 기준으로 rate limit과 CORS 제한을 적용한다.
배포 전 사용자 인증 또는 extension origin 검증 전략을 별도 결정한다.
```

### 4.4 개인정보와 로그

리스크:

```text
게시글 본문과 사용자 질문은 민감 정보를 포함할 수 있다.
```

대응:

```text
서버 로그에는 원문을 남기지 않는다.
request logger는 body length와 site 정도만 기록한다.
DB는 사용하지 않는다.
Extension storage에도 원문을 영구 저장하지 않는다.
```

## 5. 개발 마일스톤

### M1. 문서와 계약 고정

목표:

```text
구현 전에 API, 아키텍처, MVP 범위를 고정한다.
```

작업:

```text
docs/API_SPEC.md 작성
docs/ARCHITECTURE.md 작성
docs/MVP_1_PLAN.md 작성
1차 MVP에서 제외할 기능 재확인
```

완료 기준:

```text
API 요청/응답 필드가 명확하다.
Extension과 서버의 책임 경계가 명확하다.
작업 순서와 성공 기준이 문서화되어 있다.
```

### M2. 서버 API 단독 구현

목표:

```text
Extension 없이 서버 API만으로 요약과 질문 응답을 테스트할 수 있다.
```

작업:

```text
server 프로젝트 초기화
TypeScript 설정
Express 앱 구성
GET /health 구현
공통 ErrorResponse 구현
Zod schema 작성
request id 미들웨어 작성
request logger 작성
rate limit 적용
JSON body limit 적용
OpenAI client wrapper 작성
POST /api/analyze 구현
POST /api/ask 구현
.env.example 작성
```

완료 기준:

```text
서버가 로컬에서 실행된다.
GET /health가 성공한다.
샘플 요청으로 /api/analyze가 구조화된 JSON을 반환한다.
샘플 요청으로 /api/ask가 구조화된 JSON을 반환한다.
본문과 질문 원문이 로그에 출력되지 않는다.
OpenAI API Key가 코드에 포함되지 않는다.
```

### M3. Extension 기본 골격 구현

목표:

```text
Chrome Extension을 로드하면 Side Panel을 열 수 있다.
```

작업:

```text
extension 프로젝트 초기화
Manifest V3 작성
Vite + React + TypeScript 설정
Side Panel 엔트리 구성
Background Service Worker 구성
Content Script 엔트리 구성
shared message type 작성
```

완료 기준:

```text
Chrome에서 unpacked extension으로 로드된다.
Side Panel이 열린다.
기본 UI가 표시된다.
Background와 Side Panel 간 기본 메시지가 동작한다.
```

### M4. 페이지 컨텍스트 추출 구현

목표:

```text
현재 탭에서 제목, 본문, 선택 텍스트를 추출해 Side Panel에 표시한다.
```

작업:

```text
PageAdapter 인터페이스 작성
defaultAdapter 작성
adapterRegistry 작성
Content Script 메시지 핸들러 작성
Background의 현재 탭 조회와 메시지 전달 구현
Side Panel의 현재 글 가져오기 버튼 연결
ContextPreview UI 작성
추출 실패와 warning UI 작성
```

완료 기준:

```text
현재 글 가져오기를 누르면 제목과 본문 미리보기가 표시된다.
사용자가 드래그한 텍스트가 selectedText로 표시된다.
본문 추출 실패 시 명확한 경고가 표시된다.
이 단계에서 서버로 원문이 전송되지 않는다.
```

### M5. 요약/질문 End-to-End 연결

목표:

```text
Side Panel에서 서버를 통해 요약과 질문 응답을 받을 수 있다.
```

작업:

```text
Background API client 작성
서버 Base URL 기본값 설정
요약하기 버튼 연결
질문 입력창과 질문하기 버튼 연결
로딩 상태 구현
ResultPanel 구현
ErrorResponse 표시 구현
요청 크기 초과와 서버 연결 실패 메시지 처리
```

완료 기준:

```text
Side Panel에서 요약하기가 동작한다.
Side Panel에서 질문하기가 동작한다.
선택 텍스트가 질문 컨텍스트에 포함된다.
서버 오류와 OpenAI 오류가 사용자에게 표시된다.
OpenAI API Key가 extension bundle에 포함되지 않는다.
```

### M6. 1차 MVP 안정화

목표:

```text
수동 QA를 통해 첫 사용 흐름의 큰 깨짐을 제거한다.
```

작업:

```text
본문 추출 테스트 페이지 3~5개 확인
선택 텍스트 있음/없음 케이스 확인
긴 본문 요청 확인
서버 미실행 상태 확인
OpenAI API Key 누락 상태 확인
rate limit 동작 확인
README 실행 가이드 작성
```

완료 기준:

```text
처음 설치한 개발자가 README만 보고 실행할 수 있다.
요약과 질문의 기본 흐름이 end-to-end로 동작한다.
실패 상태가 조용히 무시되지 않는다.
1차 MVP 제외 기능이 UI와 코드에 섞이지 않는다.
```

## 6. 작업 우선순위

추천 순서:

```text
1. API 계약과 공통 타입
2. 서버 단독 동작
3. Extension Side Panel 골격
4. Content Script 추출
5. Background 라우팅
6. 서버 API 연결
7. 오류 처리와 QA
```

이 순서를 추천하는 이유는 extension과 서버가 동시에 흔들리지 않게 하기 위해서다. 서버 API 계약을 먼저 안정화하면 Side Panel 개발은 명확한 목표에 붙일 수 있다.

## 7. 1차 MVP 성공 기준

1차 MVP는 아래 조건을 모두 만족하면 완료로 본다.

```text
Chrome에서 unpacked extension으로 설치할 수 있다.
사용자가 게시글 페이지에서 Side Panel을 열 수 있다.
현재 글 가져오기 버튼으로 제목과 본문을 추출할 수 있다.
선택 텍스트가 질문 컨텍스트에 포함된다.
요약하기 버튼으로 구조화된 요약 결과를 받을 수 있다.
질문하기 버튼으로 게시글 기반 답변을 받을 수 있다.
OpenAI API Key가 extension에 노출되지 않는다.
사용자가 요청하기 전에는 게시글 원문을 서버로 보내지 않는다.
서버는 원문 본문과 질문을 로그에 남기지 않는다.
사실 검증, 댓글 생성, 댓글 삽입 기능은 포함되지 않는다.
```

## 8. 1차 이후 확장 계획

2차 MVP:

```text
검증 가능한 주장 추출
Web Search Tool 연동
출처 표시
불확실성 표시
검증 탭 추가
```

3차 MVP:

```text
댓글 추천
댓글 다듬기
댓글 위험도 검사
댓글 복사
댓글 입력창 삽입
```

어떤 확장에서도 자동 게시, 반복 댓글 생성, 다중 계정 지원은 구현하지 않는다.
