const { execSync } = require("child_process");

let gitCommit = "unknown";

try {
  gitCommit = execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim() || "unknown";
} catch {
  gitCommit = "unknown";
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_GIT_COMMIT: gitCommit,
  },
};

module.exports = nextConfig;
