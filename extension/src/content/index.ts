/**
 * Content Script.
 *
 * M3 골격 단계에서는 로드 확인용 로그만 남긴다.
 * M4 에서 PageAdapter 기반 컨텍스트 추출과 메시지 핸들러를 구현한다.
 * Content Script 는 서버와 직접 통신하지 않는다(ARCHITECTURE 3.4).
 */

console.debug("[ThreadWise] content script loaded:", location.href);

export {};
