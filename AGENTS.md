# Repository Guidelines

## Project Structure & Module Organization
- `App.vue`, `main.js`, and `pages.json` define the Uni-app entry, global lifecycle hooks, and routing.
- Feature pages live in `pages/` and `subPackages/` (e.g., `pages/index/index.vue`).
- Shared UI lives in `components/`, shared logic in `utils/` and `mixins/`.
- UI libraries and plugins are under `uni_modules/`; static assets are in `static/` and `public/`.
- Cloud functions/config are in `uniCloud/` and `uniCloud-aliyun/`.
- `adminEnd/` and `riderEnd/` appear to be separate clients; keep changes scoped to the target app.
- Generated output such as `unpackage/` and `node_modules/` should not be edited manually.

## Build, Test, and Development Commands
- `npm install` installs dependencies listed in `package.json`.
- No npm scripts are defined; run the app through Uni-app tooling (e.g., HBuilderX “Run” menu for the target platform) according to team practice.
- For static checks or quick edits, work directly in `.vue` files and `uni.scss`.

## Coding Style & Naming Conventions
- Indentation in `.vue` files uses tabs; keep this consistent when editing.
- Use kebab-case for file and folder names (e.g., `order-timeline.vue`).
- Use clear, descriptive class names in templates and keep global styles in `App.vue` or `uni.scss`.
- Prefer `pages.json` for routing changes; avoid hardcoding route paths elsewhere.

## Testing Guidelines
- No automated testing framework is detected.
- Perform manual testing via the target platform (WeChat/Alipay/etc.) and verify key flows after changes.
- If you add tests, document how to run them in this file.

## Commit & Pull Request Guidelines
- Recent commits are short, descriptive, and often in Chinese; follow this pattern (e.g., “订单时间轴界面优化”).
- Keep commits focused on a single change.
- PRs should include a concise summary, linked issue (if any), and screenshots or screen recordings for UI changes.

## Configuration Tips
- Key config files include `manifest.json`, `pages.json`, and `uni.scss`; review them when adding pages, permissions, or theme changes.
