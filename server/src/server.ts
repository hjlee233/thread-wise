import { createApp } from "./app.js";
import { loadConfig } from "./config.js";

/** 서버 엔트리포인트. 환경변수 로딩 실패 시 명확한 메시지로 종료한다. */
function main(): void {
  let config;
  try {
    config = loadConfig();
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }

  const app = createApp();
  const server = app.listen(config.port, () => {
    console.log(
      JSON.stringify({
        level: "info",
        message: "thread-wise-server started",
        port: config.port,
        env: config.nodeEnv,
        model: config.openaiModel,
      })
    );
  });

  // listen 실패(포트 충돌 등)를 명확한 메시지로 처리한다.
  server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      console.error(`포트 ${config.port} 가 이미 사용 중입니다. PORT 환경변수로 다른 포트를 지정하세요.`);
    } else {
      console.error(`서버 기동 실패: ${err.message}`);
    }
    process.exit(1);
  });
}

main();
