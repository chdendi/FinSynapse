---
name: market-research
description: 对特定行业/市场主题进行产业链扫描、瓶颈识别与标的优先级排序。当用户要求"扫描一下XX产业链"、"XX行业有哪些卡脖子环节"、"做XX主题的市场调研"、"哪些标的在XX赛道最值得研究"、"/market-research"时触发。
---

# Market Research Skill

本 skill **不复刻模板内容**——所有规则、字段、章节、checklist 都在 `research/templates/` 下，每次执行都重新读取。

## 流程

### 1. 强制读取（每次执行必做，不允许使用记忆中的旧版本）

按顺序读取：
1. `research/templates/industry-report.md`（主 spec，当前 v0.1）
2. `research/templates/report-frontmatter.md`（frontmatter 字段）
3. `research/templates/references/data-source-policy.md`（数据规范 + 三必标）
4. `research/templates/references/supply-chain-methodology.md`（供应链 8 层架构 + 稀缺层识别 + 标的筛选流程）
5. `research/templates/references/market-source-playbook.md`（多市场数据源路径）
6. `research/templates/references/evidence-ladder.md`（证据分级 + 红牌警示）
7. `research/templates/references/industry-metrics.md`（行业 packs，按行业引用对应章节）
8. `research/templates/references/scoring-methodology.md`（瓶颈评分方法论）
9. `research/templates/assets/industry-report-checklist.md`（自检清单 + Gate 类型）

### 2. 前置验证输出（v0.1 引入）

完成第 1 步读取后，在开始撰写前输出以下验证清单（向用户显式展示所有前置条件已满足）：

```
前置验证：
- [x] 已读取 industry-report.md（主 spec，当前 v0.1）
- [x] 已读取 report-frontmatter.md（frontmatter 字段）
- [x] 已读取 data-source-policy.md（数据来源规范 + 三必标）
- [x] 已读取 supply-chain-methodology.md（供应链扫描方法论）
- [x] 已读取 market-source-playbook.md（多市场数据源路径）
- [x] 已读取 evidence-ladder.md（证据分级体系）
- [x] 已读取 industry-metrics.md（行业指标包）
- [x] 已读取 scoring-methodology.md（瓶颈评分方法论）
- [x] 已读取 industry-report-checklist.md（自检清单 + Gate 类型）
```

凡未读取或不适用的项标注 `[N/A]` 并简述原因。

### 3. 定范围（来自 supply-chain-methodology.md §2）

在开始扫描前，先向用户确认（或合理推定）：
- **市场**：A 股 / 港股 / 美股 / 台 / 日 / 韩 / 全球
- **主题**：AI 半导体 / 先进封装 / 机器人 / 新能源 / 医疗器械 等
- **时间窗**：默认 3-12 个月

只在意缺失会**实质改变结论**的 scope 时才追问。

### 4. 落盘前检查同主题报告

在 `research/industry/<sector>/` 下查找是否已存在同主题的报告：
- 如有，**询问用户**：是更新现有报告（沿用文件名，更新 `last_material_update`）还是新建快照（用今日日期生成新文件）
- 不要默认覆盖

### 5. 命名规则（来自主 spec §2）

`research/industry/<sector>/<slug>-YYYYMMDD.md`
- `sector`：行业分类（`semiconductor` / `ai` / `new-energy` / `robotics` / `healthcare` 等）
- `slug`：中文或英文短名描述主题
- 例：`research/industry/semiconductor/A股-AI半导体产业链深度调研-20260609.md`

### 6. 撰写

按主 spec §4 正文骨架逐节产出。重点：
- TL;DR ≤200 字，独立可读
- **先排产业链层级，再排公司**（supply-chain-methodology.md 核心纪律）
- 产业链 8 层架构逐层展开，候选池 ≥20 家（市场足够大时）
- 稀缺层按 6 个信号维度判定，分 Tier 1/2/3
- 每个 Top 标的 ≥2 条强/中等证据，标注证据等级
- **至少降级 1 个热门方向**并说明原因
- 每个关键数字带 `as_of` + 来源 + 口径（data-source-policy.md 三必标）
- `## Meta` 段必填（数据缺口 + 不适用章节 + 证据覆盖率）

### 7. 自检（写完报告必做）

按 `assets/industry-report-checklist.md` 逐条检查，并按 Gate 类型处理：

- `hard_fail` 未通过：阻断报告产出，回头补数据、改结论或改写文本
- `requires_explanation` 未通过：可落盘，但必须在正文或 `## Meta` 段说明原因
- 多市场扫描额外检查 B3、B4

### 8. 更新索引

报告写完后**必须**更新 `research/README.md` 对应行业的表格，加一行新报告（含模板版本）。

### 9. 模板改进建议

如果撰写过程中发现模板/规范有不足：
- **不允许**直接修改 `research/templates/` 下的任何文件
- 必须在 `research/templates/_proposals/` 下按 `TEMPLATE.md` 格式新建一个 proposal 文件
- 同时在报告 `## Meta → 模板改进建议` 中简述并引用 proposal 文件路径

## 不要做的事

- ❌ 不要凭记忆撰写——每次都要重读 spec
- ❌ 不要把模板章节复制进本 SKILL.md——薄壳原则
- ❌ 不要直接改主 spec / references / assets——只走 proposal
- ❌ 不要默认覆盖已有报告——先问用户
- ❌ 不要给"买入/卖出/目标价"——用研究优先级代替
- ❌ 不要把 web search 摘要当硬数字来源
- ❌ 不要把行业报告写成热门股票清单——先排层级再排公司
- ❌ 不要只扫描热门 ticker——从产业链全图出发建候选池
