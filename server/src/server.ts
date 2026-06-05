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
  app.listen(config.port, () => {
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
}

main();
