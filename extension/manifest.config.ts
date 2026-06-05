import { defineManifest } from "@crxjs/vite-plugin";
import pkg from "./package.json" with { type: "json" };

/**
 * Manifest V3 정의. ARCHITECTURE 3.1 의 1차 MVP 권장 권한을 따른다.
 * 자동 게시 등 위험 기능은 포함하지 않는다.
 */
export default defineManifest({
  manifest_version: 3,
  name: "Thread Wise",
  version: pkg.version,
  description: pkg.description,

  // 1차 MVP 권장 권한.
  permissions: ["sidePanel", "activeTab", "scripting", "storage"],

  // 개발 중에는 넓게 둔다. 배포 전 지원 사이트로 좁히는 것을 검토한다(ARCHITECTURE 3.1).
  host_permissions: ["<all_urls>"],

  action: {
    default_title: "Thread Wise 열기",
  },

  side_panel: {
    default_path: "src/sidepanel/index.html",
  },

  background: {
    service_worker: "src/background/serviceWorker.ts",
    type: "module",
  },

  content_scripts: [
    {
      matches: ["<all_urls>"],
      js: ["src/content/index.ts"],
      run_at: "document_idle",
    },
  ],
});
