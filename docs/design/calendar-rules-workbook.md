# Calendar Rules Workbook

## Purpose

`data/seed/calendar-rules.xlsx` is CalRepo's human-editable, auditable seed database. It is the editorial source of truth for calendar rules before a future release pipeline renders iCalendar files.

It intentionally stores rules, not a static table of dates. A generated event must therefore retain both the originating `rule_id` and the generator version in its release metadata.

## Workbook Sheets

| Sheet | Purpose | Key |
| --- | --- | --- |
| `先看这里` | Plain-language explanation that tells the project owner which four core data sheets require review; pivot sheets remain auxiliary. | N/A |
| `日历源目录` | One row per calendar source. Availability, quality, mirroring boundary, self-build strategy, research status, and next action stay in the same row. | `source_id` |
| `节日总表` | One row per self-built event. It contains the complete date rule, time zone, evidence, review status, and notes in the same row; no duplicate advanced-rule sheet exists. | `rule_id` |
| `二十四节气` | The 24 solar-longitude rules used to generate annual dates. It records the astronomical angle and validation boundary instead of hardcoding Gregorian dates. | `TERM-01` ... `TERM-24` |
| `干支历规则` | The source-of-truth rules for the display layer: astronomical Ganzhi year, lunar civil year, solar-term Ganzhi month, Ganzhi day, zodiac, and alternate day-boundary convention. | `GZ-*`, `MONTH-*` |

## Supported Rule Types

| Rule type | Semantics | Example |
| --- | --- | --- |
| `gregorian_month_day` | Fixed Gregorian date. | National Day, 10-01 |
| `gregorian_relative_weekday` | Deterministic annual Gregorian rule expressed by an nth/last weekday and optional day offset. | Black Friday: Friday after the fourth Thursday in November. |
| `lunar_month_day` | Fixed date in the Chinese lunar calendar. | Mid-Autumn Festival, lunar 08-15 |
| `lunar_month_end` | Final day of a specified Chinese lunar month. | Chinese New Year's Eve, month 12 end |
| `solar_longitude` | Exact apparent solar longitude, calculated in the row time zone. | Lichun, 315 degrees in `Asia/Shanghai` |

Do not record a solar term as a fixed Gregorian day. Do not add Islamic, Tibetan, Yi, Miao, Easter, statutory holiday-transfer, or locally scheduled festival dates until the calculation and geographic scope have their own documented validation fixtures.

`gregorian_relative_weekday` is allowed for auditable civil rules such as the last Friday in July or a weekday offset from the fourth Thursday in November. A row using it remains `待规则审核` until a generator and cross-year fixtures exist; it must not be released merely because its prose rule is deterministic.

## Public Ganzhi Explanation

The website should explain that `农历`, `干支历`, `生肖` and `四柱命理` are related but not identical concepts. The distinction is necessary because different public sources use different year boundaries.

### Year Boundaries

- The **civil lunar year** changes on the first day of the first lunar month. This is the familiar boundary for Spring Festival, civil zodiac usage and traditional festival dates.
- The **astronomical Ganzhi year** changes at the exact Lichun moment, when the apparent solar longitude reaches 315 degrees. This is the default boundary for the Ganzhi calendar and the four-pillar calculation layer.
- Around the period between Lichun and Lunar New Year, both labels can be valid in their own systems. The website must not silently replace one with the other; it should label the convention when the two years differ.

### Month and Day Rules

- A Ganzhi month is a solar-term month, not a lunar month. The twelve month branches begin with `寅月` at Lichun and change at the twelve monthly `节` terms: Jingzhe, Qingming, Lixia, Mangzhong, Xiaoshu, Liqiu, Bailu, Hanlu, Lidong, Daxue and Xiaohan.
- The month stem is derived from the year stem using the `五虎遁` rule and then advances in order. A label such as `农历七月（乙未月）` must therefore be checked for consistency; a lunar seventh month and a Ganzhi `未月` are not interchangeable concepts.
- The default Ganzhi day changes at 00:00 China Standard Time and follows the 60-day cycle. The `子初` convention, which treats 23:00 as the day boundary, is retained only as an explicitly labelled compatibility option.

### Display and Data Policy

The default display may use `农历六月（丙午年·乙未月）` in the calendar header and `廿一（庚子日）` in a date cell. When the civil lunar year and astronomical Ganzhi year differ, show both labels with their conventions. Store `农历年`, `干支年`, `干支月` and `干支日` as separate fields; never collapse them into one generic year value.

This is a reproducible astronomical convention, not a claim that every traditional school uses the same boundary. Public articles should state the convention, timezone, calculation version and validation fixtures alongside every published result.

## Editorial Workflow

1. Start in `日历源目录`; record and verify availability, reuse boundary, research status, and strategy before adding any events.
2. Add or amend a self-built event in `节日总表`; keep its source, scope, date rule, time zone, evidence link, review state, and notes on the same row.
3. Do not copy every event from a stable external ICS source into `节日总表`; maintain the external source at source level unless CalRepo takes responsibility for its rules.
4. Mark unverified work as `待规则审核`; it cannot enter a release candidate.
5. Before publishing, generate cross-year fixtures and retain the result with the iCalendar release.

## Subscription Status

`日历源目录`中的`是否有订阅源`只允许两个值：`是`、`否`。

- `是`：当前已经找到可访问的 iCalendar/ICS 订阅链接，先允许 KeepOn 和用户直接试用。它不等于官方维护、长期稳定、数据完整或允许镜像。
- `否`：当前没有找到可直接订阅的 iCalendar/ICS 链接。网页、规则说明、普通下载页或 HTTP 500 的候选都不能填写为`是`。

官方性、稳定性、完整性、许可和是否允许 CalRepo 镜像，分别记录在`实测与质量`、`可否镜像发布`、`CalRepo 处理策略`、`规则状态`和`下一步`列，不再塞进`是否有订阅源`。

自建源另遵循 `docs/design/self-built-calendar-source-maintenance.md`：已具备规则并不等于“有订阅源”。在 CalRepo 形成用户可直接订阅的 HTTPS ICS 链接前，`是否有订阅源`仍为`否`；KeepOn 可先使用内部 `calrepo://` 规则源。

对所有`否`项，检索时同时使用英文和该国家或宗教的常用语言；只要发现可访问的订阅链接，就把该项改为`是`，并在质量列记录核验日期、HTTP 状态、内容类型、覆盖范围和风险。

## Source-Catalog Normalization

The source catalogue uses atomic fields. A source name identifies only the calendar; it must not encode ownership, lifecycle, or publication state. The following columns are mandatory for new or migrated sources:

| Field | Allowed values / meaning |
| --- | --- |
| `日历源名称` | Calendar name only. Do not append words such as self-built, deprecated, active, or a provider name. |
| `维护方式` | `自建` or `外部`. |
| `生命周期` | `启用`, `弃用`, or `待研究`. |
| `是否有订阅源` | `是` or `否` only. It records whether a usable subscription entry exists in the supported product context. |
| `发布状态` | `待实现`, `内部可用`, `公开发布`, or `保留历史`. |
| `弃用原因` | Empty unless the lifecycle is `弃用`; then records the concrete reason without deleting the historical source record. |

For China, the active catalogue is intentionally limited to two self-built sources:

1. `中国二十四节气`.
2. `中国传统节日及公共假日`, covering traditional lunar festivals, statutory holidays, and fixed observances.

The legacy Google and GitHub China feeds remain in the workbook for audit and comparison only. Their lifecycle is `弃用`; they must not be enabled as CalRepo's China source. A source may remain technically reachable while being deprecated: availability and lifecycle are separate facts.

## Table Linkage

The source catalogue, festival master, and rule sheets are linked by stable identifiers, not display names:

- `日历源目录.源编号` is the source primary key.
- `节日总表.源编号` points to the owning calendar source for every event row.
- `二十四节气.关联源编号` points to `SRC-CN-24-SOLAR-TERMS`.
- `干支历规则.关联源编号` points to the Chinese traditional/public calendar source because its display rules belong to that Chinese calendar context.

Changing a display name must never be the mechanism for changing ownership. A migration must update the identifier fields and then verify that no event or rule row has a blank source reference.

For `SRC-CN-TRADITIONAL-PUBLIC`, release validation must require eight all-citizen statutory event rows: `元旦(法)`, `除夕(法)`, `春节(法)`, `清明节(法)`, `劳动节(法)`, `端午节(法)`, `中秋节(法)`, and `国庆节(法)`. It must also require the four partial-public-holiday rows: `妇女节`, `五四青年节`, `儿童节`, and `建军节`. Every row must reference `SRC-CN-TRADITIONAL-PUBLIC`, identify its audience and legal base-days, and record whether an annual State Council General Office notice is required for the actual leave span and adjusted workdays.

## Geographic Naming

The jurisdiction for national entries is `China` / `中国`. Taiwan, Hong Kong, and Macao must not be represented as sovereign countries in CalRepo catalogues. Where a geographic qualifier is needed, use `China Taiwan`, `China Hong Kong`, or `China Macao` consistently.

## Current Seed Boundary

The initial workbook contains:

- Chinese 24 solar terms as solar-longitude rules;
- deterministic Chinese lunar traditional festivals;
- selected Chinese fixed Gregorian observances;
- selected fixed-date United Nations observances;
- a research catalogue for the requested Chinese ethnic-festival priorities, without unverified event rules.
- a dedicated `二十四节气` sheet with 24 solar-longitude rows;
- a dedicated `干支历规则` sheet documenting the default astronomical convention and compatible civil/traditional conventions.

The default Ganzhi display convention is: year changes at the exact Lichun solar term, month changes at the twelve monthly `节` solar terms, and day changes at 00:00 China Standard Time. The lunar year beginning at lunar New Year's Day is stored separately for civil zodiac and festival use. A 23:00 `子初` day boundary remains a research/compatibility option and must never be silently mixed with the default.

The initial workbook was generated by `scripts/build-calendar-rules.mjs` with the bundled artifact runtime. Once editorial work begins, the workbook is the source of truth: do not rerun the seed builder unless its current Excel edits have first been deliberately migrated into the seed script.

## Excel Compatibility Guard

Do not use an artifact-tool import/export round trip to overwrite an existing workbook that contains Excel-created PivotTables or other unsupported Excel features. The export may preserve visible sheets while producing a package Microsoft Excel reports as corrupted. Before any future machine-written update:

1. Copy the original workbook to `tmp/` as a rollback artifact.
2. Write to a separate candidate workbook and open it in Microsoft Excel without repair prompts.
3. Replace the source workbook only after this native Excel check succeeds.

For the current workbook, update the editable source script and research documents first. Apply changes to the live Excel file only using a compatibility-preserving workflow that has passed the native Excel check.
