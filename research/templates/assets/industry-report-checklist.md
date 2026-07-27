# 行业报告质量自检 Checklist (v0.1)

> 适用：所有遵循 `templates/industry-report.md` 的行业/产业链研究报告。
> 用法：报告写完后，agent 必须逐项检查；未通过项按 Gate 类型处理，并在报告 `## Meta` 段中说明。

---

## Gate 类型

| Gate | 含义 | 处理方式 |
|------|------|----------|
| `hard_fail` | 无合理解释时禁止落盘 | 补数据、改结论或改写文本后再产出 |
| `requires_explanation` | 可落盘，但必须解释 | 在正文或 `## Meta` 写明原因、口径或数据缺口 |
| `not_applicable` | 确实不适用 | 标注 N/A，并在 `## Meta → 不适用章节` 说明 |

---

## A. 完成度

| 编号 | 检查项 | Gate | 适用 |
|------|--------|------|------|
| A1 | **frontmatter 完整**：`title / as_of / tickers / markets / industry / template_version / depth / source_level / confidence / not_investment_advice / sources` 全部填写 | `hard_fail` | brief / standard |
| A2 | **TL;DR 独立可读**：≤200 字；只读 TL;DR 也能知道主题、核心发现（最稀缺层级）、优先研究标的（Top 3）、主要反方 | `hard_fail` | brief / standard |
| A3 | **产业链层级 ≥3**：报告中覆盖的产业链层级不少于 3 层 | `hard_fail` | standard |
| A4 | **候选池 ≥20**：初始标的清单不少于 20 家（市场有足够上市公司时）；若不足，在 Meta 说明 | `requires_explanation` | standard |
| A5 | **层级排序先于标的排序**：§2.3 有明确的产业链层级优先级排序，§3.3 的标的排序基于层级排序 | `hard_fail` | standard |
| A6 | **Top 标的证据达标**：每个 Top 候选至少 2 条强/中等证据，并标注证据等级 | `hard_fail` | standard |
| A7 | **热门方向降级**：至少 1 个热门方向被降级并说明原因 | `hard_fail` | standard |
| A8 | **结论结构完整**：§7 包含优先级矩阵 + 研究结论 + 降级说明 + 下一步研究清单（≥3 条）+ 判断易错点 | `hard_fail` | standard |
| A9 | **Meta 段完整**：数据缺口 + 不适用章节 + 证据覆盖率 + 模板改进建议（可选）全部填写 | `hard_fail` | standard |

---

## B. Sanity Checks

| 编号 | 检查项 | Gate | 适用 |
|------|--------|------|------|
| B1 | **每个 Top 标的有可证伪条件**：§4 的每个重点标的小节末尾有"什么情况下排名会下降" | `hard_fail` | standard |
| B2 | **证据覆盖率真实**：`## Meta → 证据覆盖率` 中的强/中/弱/待验证分布与实际报告内容一致 | `requires_explanation` | standard |
| B3 | **多市场数据源路径正确**：扫描含多个市场时，每个市场使用了对应数据源路径（见 `market-source-playbook.md`） | `requires_explanation` | cross-market |
| B4 | **跨市场口径统一**：多市场扫描中，同一指标使用同一交易日、同一币种（或显式标注折算汇率） | `requires_explanation` | cross-market |
| B5 | **无投资建议指令语言**：不得出现"买入/卖出/加仓/减仓/目标价"等词汇 | `hard_fail` | brief / standard |
| B6 | **固定免责声明存在**：正文底部必须包含免责声明 footer | `hard_fail` | brief / standard |
| B7 | **关键数字带审计线索**：财务/估值/市占率数字均带 `as_of` + 来源（规则见 `data-source-policy.md`） | `hard_fail` | brief / standard |
| B8 | **估算值显式标注**：所有推算/假设数字标注 `(估算)` / `(假设：xx)` | `hard_fail` | standard |
| B9 | **"未上市"标的已标注**：产业链地图中的未上市公司标注 `（未上市）` | `requires_explanation` | standard |

---

## 用法说明

1. 报告产出后，agent 按本 checklist 逐项检查
2. `hard_fail` 未通过时，不应落盘最终报告；应补数据、改写或调整结论
3. `requires_explanation` 未通过时，可以落盘，但必须在正文或 `## Meta` 中写明原因
4. `not_applicable` 项必须在 `## Meta → 不适用章节` 中说明
5. 自检结果不需要写进报告正文，只用于 agent 自身把关
