# Token Factory · 人民币算力经营测算器

面向 GPU 租赁与采购自建的经营规划工具。包含国内供应商公开价格、每日观察历史、可编辑成本和 Token 收入测算。全部金额为人民币。公开挂牌不是成交承诺，吞吐量中的规划假设不能代替实测。

## GitHub Actions + GitHub Pages

目标仓库：[oumoon0-jpg/TokenFactory](https://github.com/oumoon0-jpg/TokenFactory)。

部署成功后的默认访问地址为 `https://oumoon0-jpg.github.io/TokenFactory/`。实际以 Actions 的 `deploy` 步骤返回地址为准。

工作流 `.github/workflows/prices-and-pages.yml` 支持：

- 推送到 `main`：测试、采集、保存、构建、发布。
- 每天北京时间 **09:17**：在 GitHub 执行同一流程，本机无需开机。
- 手动执行：仓库 **Actions → Daily prices and GitHub Pages → Run workflow**。勾选 `refresh` 采集；取消勾选则只发布已保存数据。

首次启用时，在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。工作流自行声明本仓库所需的 `contents: write`、`pages: write`、`id-token: write` 权限，不需要向网页填入 GitHub Token，也不需要新建个人访问令牌。组织策略若禁止 Actions 写入，须由仓库管理员允许该工作流；受保护的 `main` 如果拒绝机器人提交，会在保存步骤明确失败，不能跳过历史保存假装成功。

GitHub 执行器不是长期服务器。每次采集读取仓库中的上次数据，成功观察按北京时间日期保存到 `data/history/YYYY-MM-DD.json`，并提交回 `main`。同日同条报价仅保留最近成功观察。`data/initial-market.json` 保存所有来源最新已知报价，`data/actions-runs.json` 保留最近 90 次运行摘要。网站生成每条报价最近 365 个观察日的历史。

采集失败的来源保留旧价、旧观察时间和原报价日。全部失败仍发布失败日志及旧快照，并在最后把 Actions 标成失败；部分失败在日志和网页中显示。无法解析、价格面议、外币、卡数不明不会被填成零元。云端执行器访问大陆供应商可能遇到限流或网络限制，可从 Actions 日志查看具体来源。

GitHub Pages 只提供静态网页。网页的“读取最新行情”读取最近一次已发布的数据；“运行记录 / 手动采集”链接进入 Actions 执行后台更新。个人测算输入仅保存到当前浏览器，不写入 GitHub。源码、公开价格和默认规划参数会随本公开仓库发布。

定时表达式 `17 1 * * *` 使用 UTC，对应中国北京时间 09:17。更改时间时修改工作流中的 cron，并同步 `scripts/actions-data.mjs`、`scripts/build-pages.mjs` 的展示时间。GitHub 定时任务可能排队延迟；公共仓库 60 天无活动可能自动暂停。定时工作流必须在默认分支上。详见 [GitHub 定时事件说明](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule)。

此版本是供个人学习和预算分析的静态工具，没有交易、登录或付费服务。若后续提供客户账号、收费服务或私有经营数据，需要使用带认证的服务端部署；不要直接向公开价格文件加入这些数据。

## 本地使用

需要 Node.js 24 或更新版本，无第三方 npm 依赖。

```powershell
node scripts/build.mjs
node --test tests/*.test.mjs
node scripts/dev.mjs
```

打开 `http://127.0.0.1:5188`，或者运行 `启动测算器.cmd`。本地模式仍使用 `.local/market.sqlite` 保存历史。

```powershell
# 本地数据库采集
node scripts/refresh.mjs --seed
# Actions 使用的仓库 JSON 历史采集
node scripts/actions-refresh.mjs
# 构建 GitHub Pages 静态产物
node scripts/build-pages.mjs
```

`pages-dist/` 是公开网站产物，不包含 `.local` 数据库、Sites 项目标识、浏览器个人输入或任何密钥。`outputs/Token工厂经营测算器.html` 是单文件离线版。

## 价格口径

来源覆盖共绩算力、猿界算力、全芯联储、宽泛采销、算力之光、北京数位人、ZOL 经销商历史挂牌、京东公开商品页和阿里云百炼。保存来源 URL、原价、计价单位、交付卡数、采集时间、已知报价日期、税况、成色和交付条件。

单卡、GPU 模组与整机分摊分别展示。自动匹配要求满足当前筛选规则；未知报价日期、旧挂牌、拆机等仅手动参考；标准型号缺价时保持缺失，不拿定制卡或美元换算价补齐。每个报价的条件以网页价格库中说明为准。
