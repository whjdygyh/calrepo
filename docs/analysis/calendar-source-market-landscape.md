# 日历源市场与供给调研（第一轮）

- 日期：2026-07-21
- 状态：初步调研，尚未形成投资结论
- 目标：判断 CalRepo 是否存在可持续的产品空档，而不是假定“网上没有日历源”。

## 结论摘要

基础的国家法定节假日数据、日历客户端订阅能力和开发者 API 市场已经成熟。CalRepo 不应以“提供国家节假日 ICS”作为核心卖点。

仍待验证的空档是：把国家/地区、宗教教派、民族与文化历法放在同一套可审计模型中，并以稳定 iCalendar 地址、来源、许可、适用范围、版本和更正记录对外发布。第一轮未发现已明确覆盖该组合的成熟平台，但这不是“市场不存在竞品”的证明，后续需要扩大候选样本。

## 评估口径

| 类型 | 定义 | 能否直接作为 CalRepo 订阅源 |
|---|---|---|
| 公开 iCalendar 源 | 无登录、可订阅的 `text/calendar` 地址 | 需要核验许可、稳定性、内容和来源 |
| 日历目录 | 提供用户订阅或下载的站点 | 仅能证明市场存在，不能自动再发布 |
| API | 需要参数、账户或 API Key 的结构化数据接口 | 可作研究或商业对比，不能直接替代订阅链接 |
| 历法库 | 计算规则或开发工具 | 可作自有源生成基准，不能作为托管订阅源 |

## 已核验证据

| 项目 | 实测结果 | 市场含义 | 对 CalRepo 的限制 |
|---|---|---|---|
| [Google 中国节假日](https://calendar.google.com/calendar/ical/zh.china%23holiday%40group.v.calendar.google.com/public/basic.ics) | `text/calendar`，实测 379 个 VEVENT | 大型客户端生态已提供公开国家节假日订阅 | 不能以“第一个中国法定节假日订阅”定位 |
| [CalendarLabs iCal](https://www.calendarlabs.com/ical-calendar) | 页面明确面向 Google、Mac、Outlook 导入 | 面向消费者的节假日订阅目录已存在 | 需逐条核验其生成链接和许可，不可直接转售或镜像 |
| [OfficeHolidays ICS](https://www.officeholidays.com/ics/) | 提供按国家选择的订阅入口，并覆盖宗教分类页面 | 国家和主要宗教节日目录存在成熟内容站 | 目录不等于可再发布授权 |
| [Nager.Date](https://date.nager.at/) | API 返回 187 个国家；2026 中国样本仅 6 个法定节日 | 全球法定节假日 API 供给成熟 | 覆盖不等于文化、民族、区域深度；API 不是用户订阅源 |
| [Calendarific](https://calendarific.com/) | 支持地区参数与 observance 类型 | 付费节日数据 API 已有商业竞争者 | 条款禁止将其数据重分发、转售或用于竞争性服务 |
| [Hebcal iCalendar](https://www.hebcal.com/hebcal/?v=1&cfg=ics&maj=on&year=2026&month=x&geo=none) | `text/calendar`，实测 40 个 VEVENT | 某些宗教历法已有成熟专题源 | 专题源分散，不构成统一多宗教目录 |
| [中国大陆日历](https://github.com/Lancetwang/china-mainland-calendar) | MIT；2026 ICS 实测 105 个 VEVENT，含法定节假日、调休、传统节日、二十四节气和纪念日 | 中国综合订阅源已有开源实现 | 项目创建于 2026-06、热度很低；CalRepo 不能简单复制其范围 |
| [6tail lunar-csharp](https://github.com/6tail/lunar-csharp) | MIT，涵盖农历、节气、佛历和道历计算 | 中国历法计算工具成熟 | 是规则库而非公开订阅平台 |

## 初步判断

### 已饱和的层

- 国家法定节假日：Google、CalendarLabs、OfficeHolidays、Nager.Date、Calendarific 等覆盖。
- “把 ICS 放在 GitHub”：实现门槛很低，已有很多国家、城市和机构级小项目。
- 单一历法或单一宗教：存在专题服务与开源库。

### 尚未证实饱和的层

- 每个事件都可追溯到规则、来源、许可、适用群体和最近核验日期的公开订阅平台。
- 不把民族、地区、宗派和本地择日压缩为一个“全国统一节日”的多维目录。
- 同时服务 Google/Apple/Outlook 等终端用户订阅和开发者版本化数据消费。
- 中国传统历法、民族节日和多语言解释文章之间的可追溯关联。

## 继续投入的硬门槛

在完成下列调研前，不扩大 CalRepo 的公开源数量，也不开始知识站规模化内容建设：

1. 候选池：收集至少 50 个来源，覆盖国家法定、宗教教派、文化历法、民族/地区和开源规则库。
2. 深度审计：对至少 15 个候选验证地址可访问性、事件样本、更新频率、许可和再发布权。
3. 差异验证：找到至少 3 个高价值场景，现有公开订阅不能可靠满足，而 CalRepo 能以明确规则建立自有源。
4. 维护成本：为每个候选自有源估算年度复核、事件更正和内容维护工时。
5. 决策：若无法证明至少 3 个可维护的差异源，则 CalRepo 降级为 KeepOn 内部能力，不作为独立产品投入。

## 下一轮调研

- 对 Google、CalendarLabs、OfficeHolidays、Hebcal 逐源记录许可与再发布边界。
- 审计东亚、伊斯兰、印度教、佛教、道教及中国民族日历的权威机构来源。
- 对比可公开订阅、下载导入、API、开源规则库四类产品的维护方式和商业模式。
- 评估中国市场的订阅客户端兼容性、访问稳定性和内容搜索需求。
