# WT UI Web Components

基于 [Stencil](https://stenciljs.com/) 构建的企业级 Web Components 组件库，同一套组件可以：

- 在任意框架或纯 HTML 页面中使用（`/loader` 按需加载）
- 通过 React 适配层使用（`@mache-hangar/components/react`）
- 通过 Vue 3 适配层使用（`@mache-hangar/components/vue`），支持 `v-model`
- 用 CSS 变量与 Shadow Parts 覆盖主题

仓库使用 pnpm workspace + Turborepo 管理，`packages/*` 里的库会被 docs 站点和两个 playground 直接消费。

## 仓库结构

```
web-components/
├── packages/
│   ├── components/          # @mache-hangar/components —— Stencil 组件库（含 React/Vue 适配层）
│   ├── lunar-editor-core/   # @mache-hangar/lunar-editor-core —— 框架无关的 HTML 编辑内核
│   ├── lunar-editor-react/  # @mache-hangar/lunar-editor-react —— React 编辑器及公式、表格扩展
│   └── icons/               # @mache-hangar/icons —— SVG 图标集合（构建时打入组件包）
├── docs/                    # VitePress 组件文档站
├── playground/
│   ├── react/               # React 19 + Vite 的组件演示站
│   └── vue/                 # Vue 3 + Vite 的组件演示站
├── scripts/tasks.cjs        # 构建辅助脚本（输出目录准备、资源同步、清理）
├── .husky/                  # git hooks（pre-commit 跑 lint-staged）
├── eslint.config.mjs        # ESLint flat config（TS + Vue）
├── .prettierrc.json         # Prettier 配置
├── .changeset/              # changesets 版本与 CHANGELOG 配置
├── PUBLISHING.md            # npm 发布流程
└── turbo.json               # 任务依赖与缓存配置
```

## 环境要求

- Node.js **22.12+**（Vite 7 要求 `^20.19` 或 `>=22.12`，推荐直接用 22 LTS）
- pnpm **11.x**（仓库在 `package.json` 里声明了 `packageManager: pnpm@11.1.3`，并配有 `only-allow`，用 npm/yarn 安装会被拦截）

如果本机 pnpm 版本不对：

```bash
corepack enable
corepack prepare pnpm@11.1.3 --activate
```

## 快速开始

```bash
pnpm install        # 安装依赖并链接 workspace 包
pnpm dev            # 启动所有 dev 任务（docs + 两个 playground + 组件 watch）
```

`pnpm dev` 会同时起多个进程，日志会按包名前缀聚合输出，各服务的端口以终端提示为准。

## 常用命令

| 命令                                                                       | 作用                                               |
| -------------------------------------------------------------------------- | -------------------------------------------------- |
| `pnpm dev`                                                                 | 启动全部开发服务                                   |
| `pnpm dev:doc` / `pnpm dev:components` / `pnpm dev:react` / `pnpm dev:vue` | 只启动指定子项目                                   |
| `pnpm build`                                                               | 按依赖顺序构建全部包                               |
| `pnpm build:icons`                                                         | 只构建图标包                                       |
| `pnpm build:components`                                                    | 只构建组件库（含 Stencil 产物与 React/Vue 适配层） |
| `pnpm build:doc` / `pnpm build:react` / `pnpm build:vue`                   | 只构建指定子项目                                   |
| `pnpm test`                                                                | 跑 Stencil 单元测试（依赖构建产物）                |
| `pnpm typecheck`                                                           | 全仓 TypeScript 检查                               |
| `pnpm lint`                                                                | ESLint 全仓检查                                    |
| `pnpm lint:fix`                                                            | ESLint 自动修复可修复的问题                        |
| `pnpm format`                                                              | Prettier 格式化全仓                                |
| `pnpm format:check`                                                        | 只检查格式，不写文件                               |
| `pnpm clean`                                                               | 清理各包的构建产物                                 |
| `pnpm changeset`                                                           | 创建变更记录（版本发布用）                         |
| `pnpm release`                                                             | `changeset version` + 全量构建 + 发布到 npm        |

也可以直接按包名过滤：

```bash
pnpm --filter @mache-hangar/components build
pnpm --filter react-playground dev
pnpm --filter vue-playground build && pnpm --filter vue-playground preview
```

## 子项目说明

### packages/components —— 组件库

- 源码在 `src/components/<tag>/`，通常包含 `*.tsx`、`*.scss`、`readme.md`（`readme.md` 由 Stencil 自动生成，不要手改）
- 构建产物：
  - `dist/`：Stencil 的 `dist`、`dist-custom-elements`、懒加载 ESM 与类型声明
  - `loader/`：按需注册入口
  - `output/react`、`output/vue`：从 Stencil 元数据生成的 React/Vue 适配层
- 组件级文档：`docs/components/*.md`

新增组件请先看 [packages/components/CHECKLIST.md](packages/components/CHECKLIST.md)。

### packages/icons —— 图标包

- `svg/` 存放源文件，`pnpm build:icons` 会先执行 `scripts/transfer-svg.mjs` 生成图标组件，再跑 Stencil 构建
- 图标会在组件库构建时打包进 `dist`，所以安装 `@mache-hangar/components` 即可使用 `wt-icon`，无需单独安装图标包

### docs —— 文档站

VitePress 站点，示例代码通过 `vitepress-theme-demoblock` 渲染。开发时 `pnpm dev:doc`，构建 `pnpm build:doc`。

### playground/react、playground/vue —— 演示站

两个 playground 通过 workspace 依赖引用 `@mache-hangar/components`，消费的是**构建产物**而不是源码。

所以改完组件源码后，需要在 playground 里看到效果，得先重新构建（或同时跑 `pnpm dev:components` 让 Stencil 持续 watch 输出）：

```bash
pnpm --filter @mache-hangar/components build
pnpm --filter react-playground dev
```

## 开发流程

1. 从 `main` 拉分支，改 `packages/components/src/**` 或 `packages/icons/svg/**`
2. 本地构建并跑 playground / docs 验证
3. 需要发版时用 changesets 记录变更：

```bash
pnpm changeset        # 选包、选 bump 类型（patch/minor/major）、写说明
pnpm changeset version
```

4. 提交 PR

> 注意：`packages/components/src/components.d.ts`、`dist/`、`loader/`、`www/`、`output/react*`、`output/vue*` 都是生成物，不要手改，构建会覆盖。

## 代码规范与提交钩子

- **ESLint**：[eslint.config.mjs](eslint.config.mjs)，flat config，覆盖 TS/TSX/Vue，规则集是 `@eslint/js` + `typescript-eslint` + `eslint-plugin-vue`，末尾用 `eslint-config-prettier` 关掉与格式化冲突的规则
- **Prettier**：[.prettierrc.json](.prettierrc.json)（单引号、2 空格、printWidth 180），忽略项在 [.prettierignore](.prettierignore)
- **pre-commit**：husky + lint-staged，提交时只处理**暂存区**的文件
  - `*.{js,cjs,mjs,ts,tsx,vue}` → `eslint --fix` + `prettier --write`
  - `*.{json,md,css,scss,yml,yaml,html}` → `prettier --write`
  - 配置见 [lint-staged.config.mjs](lint-staged.config.mjs)，钩子命令在 `.husky/pre-commit`

钩子通过 `pnpm install` 的 `prepare` 自动安装（`git config core.hooksPath` 会指向 `.husky/_`）。临时跳过：

```bash
git commit --no-verify -m "wip"
```

> 存量文件还没有整体跑过 Prettier，`pnpm format:check` 目前会报告一些历史文件；提交时被改动的文件会自动格式化，想一次性整理可以执行 `pnpm format`。

## 构建与发布

- 构建：`pnpm build`（Turbo 会按 `^build` 依赖顺序先构建被依赖的包；`dist/**`、`loader/**`、`output/**` 会作为缓存产物）
- 发布：见 [PUBLISHING.md](PUBLISHING.md)，核心命令是

```bash
pnpm --filter @mache-hangar/components publish --access public
```

- 版本与 CHANGELOG 由 [changesets](https://github.com/changesets/changesets) 管理，配置在 `.changeset/config.json`（`access: public`）

## Turborepo 说明

- `build` / `test` / `typecheck` 通过 `dependsOn` 自动串起依赖顺序：`icons → components → docs / playground`
- 输入未变化时直接命中本地缓存（`.turbo/cache`），CI 也能复用
- `dev` 是 `persistent` 任务且不缓存，Turbo 只负责并发拉起，不负责“等某个服务就绪再启动另一个”

## 常见问题

**playground 里改了组件不生效？**
组件包发布的是 `dist` 产物，改源码后要重新 `pnpm --filter @mache-hangar/components build`，或让 `pnpm dev:components` 持续 watch。

**`pnpm install` 被 `only-allow` 拦截？**
仓库只允许 pnpm，用 `corepack enable` 切到 `pnpm@11.1.3`。

**组件没有样式 / 主题不生效？**
使用方需要引入一次 `@mache-hangar/components/styles.css`（playground 在 `styles/dependence.scss` 里引了）。

**图标不显示？**
`wt-icon` 需要传 `name`；可用图标名见 `packages/icons` 的构建产物或 docs 的图标页。

## Lunar Editor

编辑器已迁入本仓库的 pnpm workspace，包名分别为 `@mache-hangar/lunar-editor-core` 和 `@mache-hangar/lunar-editor-react`。源码、测试、样式及包内设计文档一并维护，两个包均已配置为 MIT 许可、公开 npm 发布，并在发布前自动构建。

```bash
pnpm build:lunar-editor-react   # 按依赖顺序构建 core 和 React（含声明、CSS、公式字体）
pnpm dev:lunar-editor-react     # 先构建 core，再监听 React 源码、类型和样式
pnpm dev:lunar-editor-core      # 单独监听 core；联调内核时另开终端运行
pnpm --filter "./packages/lunar-editor-*" typecheck
pnpm exec turbo run test --filter="./packages/lunar-editor-*"
```

使用方式见 [Core 文档](packages/lunar-editor-core/README.md) 和 [React 文档](packages/lunar-editor-react/README.md)。业务层的修订、AI、PDF 联动仍由使用方实现。

运行 `pnpm dev:react`，访问终端显示地址下的 `/lunar-editor`，或点击侧边栏的 `lunar-editor`。演示默认展示富文本、表格和 HTML 源码预览；点击“编辑源码”加载源码编辑器，点击“启用公式”加载公式扩展并追加示例。修改源码后点击“应用源码”更新富文本；修改富文本会实时更新源码。应用源码、重置示例和启用公式会清空富文本历史。
