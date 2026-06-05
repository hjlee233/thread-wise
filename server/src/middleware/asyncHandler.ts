import type { NextFunction, Request, Response, RequestHandler } from "express";

/**
 * Express 4 는 async 핸들러의 reject 를 자동 포착하지 않으므로,
 * 비동기 라우트를 감싸 에러를 next() 로 전달한다.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}
