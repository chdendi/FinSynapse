# 调研索引

## 撰写规范

- **个股报告**：统一使用 [`templates/company-analysis.md`](templates/company-analysis.md)（v0.3）
  - frontmatter：[`templates/report-frontmatter.md`](templates/report-frontmatter.md)
  - 数据规范：[`templates/references/data-source-policy.md`](templates/references/data-source-policy.md)
  - 行业指标：[`templates/references/industry-metrics.md`](templates/references/industry-metrics.md)
  - 跨市场（AH/ADR）：[`templates/references/cross-market-policy.md`](templates/references/cross-market-policy.md)
  - 写完自检：[`templates/assets/report-quality-checklist.md`](templates/assets/report-quality-checklist.md)
  - 改进建议：[`templates/_proposals/`](templates/_proposals/)
- **行业/产业链报告**：统一使用 [`templates/industry-report.md`](templates/industry-report.md)（v0.1）
  - 供应链方法论：[`templates/references/supply-chain-methodology.md`](templates/references/supply-chain-methodology.md)
  - 多市场数据源：[`templates/references/market-source-playbook.md`](templates/references/market-source-playbook.md)
  - 证据分级：[`templates/references/evidence-ladder.md`](templates/references/evidence-ladder.md)
  - 评分方法：[`templates/references/scoring-methodology.md`](templates/references/scoring-methodology.md)
  - 写完自检：[`templates/assets/industry-report-checklist.md`](templates/assets/industry-report-checklist.md)
- **个股文件命名**：`stocks/<market>/<ticker>-<slug>-YYYYMMDD.md`（详见主 spec 第 2 节）
  - 示例：`stocks/hk/00981-HK-smic-20260505.md`
- **行业文件命名**：`industry/<sector>/<slug>-YYYYMMDD.md`（详见 industry-report.md §2）
  - 示例：`industry/semiconductor/A股-AI半导体产业链深度调研-20260609.md`
- **旧报告**：不强制迁移到新模板，只约束新报告

## 行业调研

### 半导体

| 文件 | 日期 | 简介 | 模板版本 |
|------|------|------|:-------:|
| [A股-AI半导体产业链深度调研-20260609.md](industry/semiconductor/A股-AI半导体产业链深度调研-20260609.md) | 2026-06-09 | A 股 AI 半导体全产业链 8 层扫描，Tier 1/2/3 卡脖子环节识别，Top 5 标的优先级排序 | v0.1 |
| [中国AI芯片自主化全景图-20260504.md](industry/semiconductor/中国AI芯片自主化全景图-20260504.md) | 2026-05-04 | 国产 AI 芯片公司总览（华为海思/寒武纪/海光等），含估值、财务、代工供应链分析 | legacy |
| [半导体行业周期性分析-20260504.md](industry/semiconductor/半导体行业周期性分析-20260504.md) | 2026-05-04 | 半导体行业周期框架、供需驱动与投资时钟分析 | legacy |
| [芯片制造核心概念解读-20260504.md](industry/semiconductor/芯片制造核心概念解读-20260504.md) | 2026-05-04 | 芯片制造入门：晶圆、光刻胶、DUV/EUV、刻蚀机等核心概念科普 | legacy |

### AI 产业链

| 文件 | 日期 | 简介 |
|------|------|------|
| [NVIDIA-路线图与供应链全景分析-20260530.md](industry/ai/NVIDIA-路线图与供应链全景分析-20260530.md) | 2026-05-30 | NVIDIA Blackwell→Rubin→Feynman 路线图、供应链各环节增速、A/H 股相关公司及护城河分析 |
| [DeepSeek-V4-产业链分析-20260503.md](industry/ai/DeepSeek-V4-产业链分析-20260503.md) | 2026-05-03 | DeepSeek V4 芯片供应链、云部署、关联上市公司估值分析 |

---

## 个股调研

### A 股

| 文件 | 日期 | 标的 | 模板版本 |
|------|------|------|:-------:|
| [688981-smic-20260505.md](stocks/cn/688981-smic-20260505.md) | 2026-05-05 | 688981（中芯国际） | v0.1 |
| [中芯国际SMIC深度分析-20260504.md](stocks/cn/中芯国际SMIC深度分析-20260504.md) | 2026-05-04 | 688981 | legacy |

### 港股

| 文件 | 日期 | 标的 | 模板版本 |
|------|------|------|:-------:|
| [9992-HK-popmart-20260505.md](stocks/hk/9992-HK-popmart-20260505.md) | 2026-05-05 | 9992.HK（泡泡玛特） | v0.2 |
| [00981-HK-smic-20260505.md](stocks/hk/00981-HK-smic-20260505.md) | 2026-05-05 | 00981.HK（中芯国际） | v0.1 |
| [中芯国际港股优劣势综合分析-20260504.md](stocks/hk/中芯国际港股优劣势综合分析-20260504.md) | 2026-05-04 | 00981.HK | legacy |

### 美股

| 文件 | 日期 | 标的 | 模板版本 |
|------|------|------|:-------:|
| [PDD-pinduoduo-20260528.md](stocks/us/PDD-pinduoduo-20260528.md) | 2026-05-28 | PDD（拼多多 / PDD Holdings） | v0.3 |

### 韩国

| 文件 | 日期 | 标的 | 模板版本 |
|------|------|------|:-------:|
| [000660-sk-hynix-20260509.md](stocks/kr/000660-sk-hynix-20260509.md) | 2026-05-09 | 000660.KS（SK 海力士） | v0.3 |
| [005930-samsung-electronics-20260509.md](stocks/kr/005930-samsung-electronics-20260509.md) | 2026-05-09 | 005930.KS（三星电子） | v0.3 |
