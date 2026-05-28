# 模板改进建议：新增电商平台 / marketplace 行业指标 pack

> 提出日期：2026-05-28
> 提出人 / agent：Codex
> 状态：pending
> 优先级：P1
> 目标版本：v0.4

## 1. 出现在哪份报告

- 路径：`research/stocks/us/PDD-pinduoduo-20260528.md`
- 章节：§1.4 行业地位、§2.5 行业指标补充、§6 估值

## 2. 建议改哪个文件 / 哪一节

- 文件：`research/templates/references/industry-metrics.md`
- 章节：新增 `ecommerce_platform` 或在 `consumer` 下新增子 pack
- 改动类型：新增

## 3. 问题描述

当前 `consumer` pack 主要面向品牌零售、门店、库存、同店销售等场景；PDD 这类平台型电商的核心变量是 GMV、active buyers / active merchants、take rate、广告 monetization、履约/支付成本、平台补贴、跨境小包合规成本和商家生态质量。若套用传统消费 pack，会漏掉平台经济最关键的经营杠杆。

## 4. 建议改法

建议新增电商平台 pack：

```markdown
## 电商平台 / Marketplace (`ecommerce_platform`)

### 子分类
- 国内 marketplace
- 自营零售 + marketplace 混合
- 跨境 marketplace
- 内容 / 直播电商

### 业务画像补充
| 指标 | 描述 / 口径 |
|------|------------|
| GMV | 平台成交额，区分已支付 / 下单 / 退款后口径 |
| Active buyers | 年度或季度活跃购买用户 |
| Active merchants | 有订单或付费服务的商家数量 |
| Take rate | 平台收入 / GMV，需说明是否含广告、佣金、履约服务 |
| 收入结构 | 广告 / 佣金 / 履约服务 / 自营零售 / 金融科技 |
| 地域结构 | 中国本土 / 跨境 / 海外本地履约 |
| 商家集中度 | Top merchant 或品类集中度，如披露 |

### 财务体检补充
| 指标 | 描述 |
|------|------|
| 广告收入增速 | 对商家 ROI 和平台流量质量敏感 |
| 交易服务收入增速 | 对佣金、履约和增值服务渗透率敏感 |
| 履约 / 支付 / 云成本率 | 通常体现在 cost of revenue |
| 销售费用率 | 补贴、获客、品牌投放和海外扩张强度 |
| 平台经营杠杆 | 收入增速与经营利润率变化的方向是否一致 |
| 现金托管与商家应付款 | merchant payable / deposit 的规模与流动性影响 |

### 风险特别提示
- 反垄断、平台责任、消费者保护、假货治理
- 跨境关税、de minimis、包裹税、产品安全合规
- 数据合规与跨境数据传输
- 内容电商 / 低价竞争导致的 merchant ROI 下行

### 估值提示
- 平台广告 / 佣金模型可用 PE、P/FCF、EV/EBITDA
- 自营零售占比高时 PS 不可与纯平台直接比较
- 跨境扩张期需单列海外亏损或履约投资
```

## 5. 优先级与目标版本

**本提案优先级：P1**。电商平台是常见标的，缺 pack 会影响 PDD、BABA、JD、MELI、CPNG、Amazon 等报告的经营指标完整性。

**目标版本：v0.4**。建议先再试跑 1-2 份平台电商报告后合并，避免 PDD 单一案例过度塑形。

## 6. 兼容性评估

| 维度 | 影响 | 说明 |
|------|------|------|
| 已发布报告 | 否 | 新增 pack，不要求旧报告回填 |
| 主 spec 骨架 | 否 | 只补行业指标 |
| 其他 references 文件 | 否 | 暂不需要 |
| Quality checklist | 否 | pack 内可自带 sanity checks |
| 各 agent 薄壳 | 否 | AGENTS.md / SKILL.md 只引用主 spec |

## 7. 风险与权衡

电商平台横跨消费、互联网广告、物流履约和金融科技，单一 pack 可能过宽。建议先以 marketplace 核心指标为主，金融科技和物流自营仅作为扩展项。

---
（Review 区由 reviewer 填写）
