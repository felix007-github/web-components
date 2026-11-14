# 发布到 npm

## 当前准备的输出命名迁移（2026-11-14）

components 0.1.4、icons 0.1.3 已发布，并已通过官方 npm registry 核对。Stencil namespace 分别为
`mache-hangar-components`、`mache-hangar-icons`，输出目录与文件使用相同名称。
应用推荐统一使用 `@mache-hangar/components/styles.css`，避免依赖输出目录结构。
仅保留当前样式入口，不提供旧命名的兼容别名。Logo 默认不显示文字，日志与注册标识也使用当前命名。
发布前先构建、检查 tarball；发布 icons 后再发布 components，发布操作单独执行。

仓库里的基础组件包如下；两个 Lunar Editor 包的发布流程见下方说明，其余应用 workspace 保持 `private: true`。

| 包                         | 目录                  | 当前版本 | 已发布版本 |
| -------------------------- | --------------------- | -------- | ---------- |
| `@mache-hangar/components` | `packages/components` | 0.1.4    | 0.1.4      |
| `@mache-hangar/icons`      | `packages/icons`      | 0.1.3    | 0.1.3      |

> 包名决定发布位置：只有 `name` 为 `@mache-hangar/...` 时才会发到这个 scope 下。
> 仓库内部的自引用（React/Vue 适配层 `import '@mache-hangar/components/...'`、`stencil.config.ts` 的 `stencilPackageName`、`tsconfig` 的 paths）必须与包名一致，改包名时请一起改并重新构建，否则发布出去的适配层会引用一个不存在的包。

## Lunar Editor 首次发布

`@mache-hangar/lunar-editor-core` 与 `@mache-hangar/lunar-editor-react` 当前版本均为 `0.0.1`，
已设置 MIT 许可、`publishConfig.access: public`、npm 官方 registry 和发布前自动构建。
React 包会随包附带字体及样式的第三方许可说明。

在仓库根目录执行；先完成 npm 登录、检查，并提交发布配置以保持工作区干净：

```bash
pnpm exec turbo run build typecheck test --filter=@mache-hangar/lunar-editor-react...
pnpm --filter @mache-hangar/lunar-editor-core --filter @mache-hangar/lunar-editor-react pack

# Core 成功发布、且能查询到目标版本后，再发布 React。
pnpm --filter @mache-hangar/lunar-editor-core publish --access public
npm view @mache-hangar/lunar-editor-core@0.0.1 version --registry=https://registry.npmjs.org
pnpm --filter @mache-hangar/lunar-editor-react publish --access public
npm view @mache-hangar/lunar-editor-react@0.0.1 version --registry=https://registry.npmjs.org
```

后续发布须提升对应包版本。`pnpm pack` / `pnpm publish` 会自动将 React 对 Core 的
`workspace:*` 依赖转换成 Core 的实际版本号。

## 0. 前置条件

- 拥有 npm 账号，并且是该 scope（`@mache-hangar`）的成员/所有者
- 账号已开启 2FA（发布时要输入一次性验证码）
- 目标版本号必须大于已发布版本（发布前用 npm view 核对，准备版本不代表已发布）

## 1. 登录（只做一次）

```bash
npm login          # 浏览器授权，会写入 ~/.npmrc
npm whoami         # 应返回你的 npm 用户名
```

如果 `npm whoami` 返回 **401**，说明 `~/.npmrc` 里残留的 `_authToken` 已失效：
先删掉 `~/.npmrc` 中 `//registry.npmjs.org/:_authToken=...` 这一行，再 `npm login`。

CI 场景用 token（不要提交到仓库）：

```bash
npm config set //registry.npmjs.org/:_authToken="$NPM_TOKEN"
```

## 2. 发布组件库

```bash
# 1) 构建（会自动先构建 icons，并重新生成 dist / react / vue 适配层）
pnpm --filter @mache-hangar/components build

# 2) 自检：打一个本地 tarball 看内容
pnpm --filter @mache-hangar/components pack --pack-destination /tmp/pkgs
tar -tzf /tmp/pkgs/mache-hangar-components-0.1.4.tgz | head -30   # 应包含 dist/ loader/ output/ LICENSE readme.md

# 3) 提交（publish 前保持工作区干净，避免 pnpm 的 git 检查失败）
git add -A && git commit -m "chore: release 0.1.4"

# 4) 发布
pnpm --filter @mache-hangar/components publish --access public
# 开启 2FA 时需要：--otp 123456
```

`packages/components` 的 `prepublishOnly` 会在发布前再跑一次 `build`，
即使忘记手动构建也不会发出空包（代价是多花一次构建时间）。

发布后验证：

```bash
npm view @mache-hangar/components version
npm view @mache-hangar/components dist.tarball
npx -y --package=@mache-hangar/components@0.1.4 node -e "console.log(require.resolve('@mache-hangar/components/package.json'))"
```

## 3. 发布 icons（可选）

组件包已经把图标打进 `dist`，`@mache-hangar/icons` 只是 `devDependencies`，
所以**不发 icons 也能装组件包**。需要单独发时：

```bash
pnpm --filter @mache-hangar/icons build
pnpm --filter @mache-hangar/icons publish --access public
```

注意：本地 icons 版本是 `1.0.0`，已发布的是 `0.1.1`，发布后是大版本跳跃。
如果只是想发个补丁，先把 `packages/icons/package.json` 的 version 改成 `0.1.2`。

> 根目录的 `pnpm run publish` 会递归发布 `packages/*` 下所有符合发布条件的包，包括两个 Lunar Editor 包。
> 只想发组件库时请用上面的 `--filter @mache-hangar/components` 写法。

## 4. 后续版本：用 changesets 管版本和 changelog

仓库已初始化 `.changeset/config.json`（`access: public`）：

```bash
pnpm changeset                 # 选择包、bump 类型（patch/minor/major），写变更说明
pnpm changeset version         # 按 changeset 升版本、写 CHANGELOG
pnpm release                   # = changeset version && turbo run build && changeset publish
```

`changeset publish` 会自动跳过已发布版本，并对改动过的包依次执行 `pnpm publish`。
手工改 version 也可以，但要保证 `@mache-hangar/icons`（如果作为依赖）先于依赖它的包发布。

## 5. 组件包的发布配置（已就位）

`packages/components/package.json` 里这些字段决定产物是否可用，改动时注意：

| 字段                           | 作用                                                                                                                |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| `name` / `version`             | 发布位置与版本                                                                                                      |
| `exports`                      | `.`（ESM 构建）、`./core`、`./react`、`./vue`、`./loader`、`./dist/components/*`、CSS 入口                          |
| `files`                        | 只发 `dist/`、`loader/`、`output/`（加自动附带的 README/LICENSE）                                                   |
| `publishConfig.access: public` | scoped 包必须显式公开，否则发布后是私有包                                                                           |
| `dependencies`                 | `@stencil/react-output-target`、`@stencil/vue-output-target` 是运行时依赖，必须在这里（devDependencies 不会被安装） |
| `peerDependencies`             | `react` / `vue`，且 `peerDependenciesMeta.optional`，避免只装其中一个框架时报错                                     |
| `prepublishOnly`               | 发布前自动构建                                                                                                      |
| `types` / `exports.*.types`    | TS 类型入口，缺失会导致使用方 `any` 或类型报错                                                                      |

## 6. 常见报错对照

| 报错                                            | 原因 / 处理                                                                                         |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `E401 Unauthorized`                             | 未登录或 token 失效，重新 `npm login`                                                               |
| `E403 Forbidden`                                | 账号没有该 scope/包权限；或 scoped 包没加 `--access public`                                         |
| `E404 Not found` / `Scope not found`            | scope 拼错、不存在，或包名被改成了别人拥有的 scope                                                  |
| `EPUBLISHCONFLICT`                              | 该版本已发布，提升 `version` 后重试（已发布版本号不能复用）                                         |
| 安装后 `Cannot find module '@mache-hangar/...'` | 构建产物里的自引用没更新，重跑 `build` 再发（检查 `output/react`、`output/vue`、`dist/collection`） |
| 安装后组件无样式                                | 使用方没引入 `@mache-hangar/components/styles.css`                                                  |

## 7. 撤销 / 弃用

```bash
# 发布 72 小时内可以彻底删除（同版本号仍不可复用）
npm unpublish @mache-hangar/components@0.1.4 --force

# 推荐做法：标记弃用并提示升级
npm deprecate @mache-hangar/components@"<0.1.2" "use 0.1.2+ instead"
```
