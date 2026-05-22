/**
 * PM2 on the VPS — cwd: /websites/brain-wave/brainwave-academy/current (symlink after CI deploy).
 * Runtime secrets: .env in DEPLOY_PATH root (copied into each release by deploy.yml).
 */
module.exports = {
  apps: [
    {
      name: "bwe-academy",
      cwd: __dirname,
      script: "server.js",
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "development",
        HOSTNAME: "0.0.0.0",
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: "production",
        HOSTNAME: "0.0.0.0",
        PORT: 3000,
      },
    },
  ],
};
