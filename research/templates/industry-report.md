# 行业/产业链研究报告模板 (Industry Report Spec)

> **template_version**: 0.1
> **last_revised**: 2026-06-09
> **适用**：行业或宽基市场主题的产业链扫描、卡位分析、标的优先级排序

---

## 0. 本文件是什么 / 不是什么

本文件是**单一真源**，规定一份行业/产业链研究报告应该包含哪些章节、写到什么程度、按什么口径。任何 agent 在产出报告前**必须**重新读取本文件。

**本文件只放骨架与引用，不重复其他文件已经规定的内容**：

| 关注点 | 文件 |
|--------|------|
| Frontmatter 字段定义 | [`report-frontmatter.md`](./report-frontmatter.md) |
| 数据来源优先级 / 审计线索 / 估算标注 | [`references/data-source-policy.md`](./references/data-source-policy.md) |
| 供应链扫描方法论（8 层架构 / 稀缺层识别 / 标的筛选） | [`references/supply-chain-methodology.md`](./references/supply-chain-methodology.md) |
| 多市场数据源路径（A 股 / 港股 / 美股 / 台 / 日 / 韩 / 欧） | [`references/market-source-playbook.md`](./references/market-source-playbook.md) |
| 证据分级体系（强 / 中 / 弱 + 红牌警示） | [`references/evidence-ladder.md`](./references/evidence-ladder.md) |
| 瓶颈评分方法论（加权评分 + 惩罚因子） | [`references/scoring-methodology.md`](./references/scoring-methodology.md) |
| 行业特定指标扩展包 | [`references/industry-metrics.md`](./references/industry-metrics.md) |
| 报告完成度与 sanity 自检 | [`assets/industry-report-checklist.md`](./assets/industry-report-checklist.md) |
| 模板改进建议提交流程 | [`_proposals/README.md`](./_proposals/README.md) |

发现需要新增/修改 spec 时 → 写 proposal 到 `_proposals/`，**不要**直接改本文件或上述 references / assets。

---

## 1. 使用规则（写给 agent）

1. **重读 spec**：每次产出报告前，重读本文件 + 上表所有 references + assets，不允许使用记忆中的旧版本
2. **不复刻模板**：薄壳 skill / instruction 里**不允许**复制本文件的章节正文，只能引用路径
3. **改模板走 proposal**：发现模板不足 → 写到 `_proposals/YYYYMMDD-<slug>.md`，不要直接改本文件
4. **重名询问**：落盘前检查 `research/industry/<sector>/` 是否已有同主题报告，若有，问用户是"更新现有报告"还是"新建快照"
5. **写完自检**：按 `assets/industry-report-checklist.md` 全部勾选；任何不通过项必须在报告 `## Meta` 段说明
6. **更新索引**：报告写完后必须更新 `research/README.md` 的行业索引表
7. **先排层级再排公司**：报告重点在产业链稀缺环节，不是简单的热门股票列表（详见 `references/supply-chain-methodology.md`）

---

## 2. 文件命名与落盘

- **路径**：`research/industry/<sector>/<slug>-YYYYMMDD.md`
  - `sector`：行业分类，如 `semiconductor` / `ai` / `new-energy` / `robotics` / `healthcare`
  - `slug`：中文短名或英文短名，描述主题（如 `AI芯片自主化全景图` / `A股-AI半导体产业链深度调研`）
  - `YYYYMMDD`：报告**最后实质性更新日期**
- **示例**：`research/industry/semiconductor/A股-AI半导体产业链深度调研-20260609.md`
- **已有报告**：如 `sector` 目录下已存在同 slug 报告，按使用规则第 4 条处理

---

## 3. Frontmatter

完全复用 [`report-frontmatter.md`](./report-frontmatter.md)。本文件**不重复**字段定义。

行业报告的 frontmatter 补充说明：

| 字段 | 行业报告填写规则 |
|------|-----------------|
| `title` | 报告标题（如 `A股 AI 半导体产业链深度调研报告`） |
| `tickers` | 报告中重点分析的标的列表（可为数组），不要求全覆盖 |
| `industry` | 顶格行业分类，如 `semiconductor` |
| `depth` | 行业报告默认 `standard`；`brief` 可只出 TL;DR + 层级排序 + 前 3 标的 |
| `confidence` | 整体研究置信度；若大量依赖 web search 且无 L1 来源，必须 ≥`low` |

新报告的 `template_version` 必须填写本文件顶部的版本号（当前 `0.1`）。

---

## 4. 正文骨架（供应链导航结构）

> 塔尖：TL;DR（独立可读的扫描结论与优先排序）
> 塔身：5 个固定章节（产业链全景 → 稀缺层识别 → 标的排序 → 重点分析 → 风险汇总）
> 塔基：结论 + Meta（优先级矩阵 + 证据缺口 + 下一步研究清单）

```markdown
# <主题标题>

> 调研日期：YYYY-MM-DD
> 方法：按 supply-chain-methodology.md 执行的多层产业链扫描
> 范围：[市场] [主题] 全产业链

## TL;DR（≤200 字，独立可读）
- **主题**：一句话定义扫描主题与市场范围
- **核心发现**：最稀缺的产业链层级是什么，为什么
- **优先研究**：Top 3 标的及一句话理由
- **主要反方**：该判断最容易错在哪

## 1. 产业链全景（Supply Chain Map）
### 1.1 产业定义与边界
### 1.2 产业链 8 层架构图
（按 supply-chain-methodology.md §3 模板展开，从终端需求到物理基础设施）
### 1.3 各层标的清单
（每层列出 ≥3 家上市公司/未上市公司，形成 ≥20 家候选池）

## 2. 卡脖子环节识别（Scarce Layer Identification）
### 2.1 稀缺层判定
（按 supply-chain-methodology.md §4 的 6 个信号维度：不可替代性 / 供应商数量 / 认证周期 / 扩产难度 / 客户紧迫度 / 市场认知滞后）
### 2.2 卡脖子层级表
（Tier 1 致命 / Tier 2 严重受限 / Tier 3 快速追赶）
### 2.3 层级排序
（先排产业链层级，再排公司）

## 3. 标的筛选与排序（Candidate Screening & Ranking）
### 3.1 候选池（≥20 家）
（从全产业链筛选，覆盖明显龙头 / 上游设备 / 关键材料 / 检测 / EDA/IP / 封装 / 基础设施 等，不全依赖热门 ticker）
### 3.2 排序逻辑
（按 supply-chain-methodology.md §7 的 8 维排序框架：需求压力 / 稀缺度 / 供应商集中度 / 扩产难度 / 证据强度 / 估值错配 / 近期催化剂 / 风险折让）
### 3.3 优先级排序表（Top 3-7）

## 4. 重点标的分层分析（Deep Dive on Top Candidates）
（每个标的独立小节，含：产业链位置、卡位分析、证据摘要、排序理由、主要风险）
### 4.1 第 1 名
### 4.2 第 2 名
### 4.3 第 3 名
...（≥3 家，≤7 家）

## 5. 财务质量交叉验证（Financial Cross-Validation）
（Top 3-7 标的的核心财务指标对比表：营收 / 净利润 / 毛利率 / ROE / 应收占比 / 研发费用率 / 经营现金流 / 净利润）
[如有行业特定指标，参考 industry-metrics.md 对应 pack]

## 6. 风险因素汇总（Risk Summary）
（按 risk 类型分组：地缘 / 技术路线 / 周期 / 估值 / 汇率 / 政策）

## 7. 结论与跟踪（Conclusion & Tracking）
### 7.0 优先级矩阵
（标的 / 卡位环节 / 核心逻辑 / 重点风险 的汇总表）
### 7.1 研究结论
（产业链层级优先级 + 标的优先级 + 降级分析）
### 7.2 热点降级说明
（至少 1 个热门方向被降级，说明原因）
### 7.3 下一步研究清单
（≥3 条具体可执行的下一步验证动作，含数据源）
### 7.4 判断易错点
（该判断最容易在什么条件下被推翻）

## Meta（必填，用于模板自迭代）
- **数据缺口**（必填）：本次没拿到的关键数据，及其影响
- **不适用章节**（必填，若有 N/A）：哪些章节标注了 N/A，原因
- **证据覆盖率**（必填）：强证据 / 中等证据 / 弱证据 / 待验证 数量分布
- **模板改进建议**（可选）：本次撰写中发现模板的不足；如有，agent 须同步在 `_proposals/` 提交 proposal
```

---

## 5. 关键概念说明

### 5.1 产业链 8 层架构

详细方法见 [`references/supply-chain-methodology.md`](./references/supply-chain-methodology.md) §3。简述：

| 层 | 内容 | 示例 |
|----|------|------|
| 1 | 终端客户与资本支出源 | 云厂商 AI CapEx、国家智算中心 |
| 2 | 系统集成商与 OEM | AI 服务器厂商、光通信系统商 |
| 3 | 模块与子系统 | 光模块、交换机、液冷系统 |
| 4 | 芯片、器件与核心元件 | GPU/CPU/FPGA/ASIC、DSP、激光器 |
| 5 | 制程、封装与测试 | 晶圆代工、先进封装、CP 测试 |
| 6 | 设备与量测 | 刻蚀、薄膜沉积、检测设备 |
| 7 | 材料、耗材与特种输入 | 硅片、光刻胶、电子特气、基板 |
| 8 | 物理基础设施 | 电力、冷却、厂房、纯水/化学品 |

### 5.2 稀缺层信号维度

详见 [`references/supply-chain-methodology.md`](./references/supply-chain-methodology.md) §4。判定一个产业链层级是否稀缺，看以下信号叠加程度：

1. **客户离不开它**（不可替代性）
2. **供应商数量少**（集中度高）
3. **认证周期长**（新进入者无法快速替代）
4. **扩产需要专用设备/许可/工艺**（物理约束）
5. **客户表现出紧迫感**（预付款 / 长协锁定 / 加急订单）
6. **公开市场仍以旧业务分类看待该公司**（认知滞后）

### 5.3 证据分级

详见 [`references/evidence-ladder.md`](./references/evidence-ladder.md)。核心规则：

- **强证据**（年报/公告/交易所文件/专利/批文）→ 可支撑高置信度结论
- **中等证据**（媒体/行业数据/券商研报）→ 可支撑但需标注
- **弱证据**（KOL/社交/传闻）→ 只能作为线索，不能独立支撑排名

每个 Top 候选标的必须至少 2 条强或中等证据。

### 5.4 标的分层分类

在候选池中按如下分类标注每个标的：

| 分类 | 含义 |
|------|------|
| **控制稀缺层** | 直接掌握稀缺环节的定价权 |
| **供应稀缺层** | 向稀缺层提供关键输入 |
| **受益于需求但控制有限** | 需求拉动但不控制供应瓶颈 |
| **有曝光但议价力弱** | 主题相关但定价权弱 |
| **故事好但证据弱** | 叙事强但缺乏可验证证据 |

---

## 6. 多市场扫描

当扫描范围覆盖多个市场（如 A 股 + 港股 + 美股），必须遵循：

1. 每个市场使用对应数据源路径（见 [`references/market-source-playbook.md`](./references/market-source-playbook.md)）
2. 跨市场标的比较时，统一交易日与币种口径
3. 注意不同市场的估值体系差异（A 股叙事溢价 / 港股流动性折价 / 美股全球化定价）

---

## 7. 数据与质量

- **数据来源、审计线索、估算标注、口径规范** → [`references/data-source-policy.md`](./references/data-source-policy.md)
- **多市场数据源路径** → [`references/market-source-playbook.md`](./references/market-source-playbook.md)
- **证据分级与红牌警示** → [`references/evidence-ladder.md`](./references/evidence-ladder.md)
- **行业特定指标** → [`references/industry-metrics.md`](./references/industry-metrics.md)
- **评分方法论** → [`references/scoring-methodology.md`](./references/scoring-methodology.md)
- **报告写完自检** → [`assets/industry-report-checklist.md`](./assets/industry-report-checklist.md)

---

## 8. Changelog

| 版本 | 日期 | 变更 |
|------|------|------|
| 0.1  | 2026-06-09 | 初版：产业链 8 层架构 + 稀缺层识别 + 标的排序框架 + 证据分级 + 评分方法论。方法论参考 serenity-skill 供应链瓶颈狩猎体系。新增 references: supply-chain-methodology / market-source-playbook / evidence-ladder / scoring-methodology；新增 assets: industry-report-checklist |
