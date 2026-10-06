import packageJson from "../../package.json";

const UI_BUILD_LABEL = "UI12G";

export function AppVersionBadge() {
  const gitCommit = process.env.NEXT_PUBLIC_GIT_COMMIT ?? "unknown";

  return (
    <aside className="app-version-badge" aria-label="현재 UI 빌드 정보">
      <span>GameProbe Preview</span>
      <strong>UI Build: {UI_BUILD_LABEL}</strong>
      <span>App v{packageJson.version}</span>
      <span>commit {gitCommit}</span>
    </aside>
  );
}
