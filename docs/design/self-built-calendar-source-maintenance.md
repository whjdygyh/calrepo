# Self-Built Calendar Source Maintenance Manual

- Owner: CalRepo / KeepOn editorial maintainers
- Version: 1.0
- Updated: 2026-07-23

## Current Sources

| Source ID | Scope | Internal source | Implementation | Public status |
| --- | --- | --- | --- | --- |
| `SRC-CN-24-SOLAR-TERMS` | China; 24 solar terms on the China Standard Time calendar date | CalRepo rule baseline | `scripts/generate-solar-terms.py` | Public: `/ical/v1/cn/solar-terms/zh-CN.ics` |
| `SRC-CN-TRADITIONAL-PUBLIC` | China mainland general scope; traditional festivals, public holidays and selected national observances | CalRepo rule baseline | `scripts/generate-china-traditional-public.ps1` | Public: `/ical/v1/cn/traditional-public/zh-CN.ics` |
| `SRC-BUDDHIST-HAN` | Han Buddhist traditions in China and overseas Chinese communities | 6tail lunar-csharp MIT rule reference | `scripts/generate-chinese-religious.ps1` | Public: `/ical/v1/religion/han-buddhism/zh-CN.ics` |
| `SRC-TAOIST` | Daoist traditions in China; schools and temples may differ | 6tail lunar-csharp MIT rule reference | `scripts/generate-chinese-religious.ps1` | Public: `/ical/v1/religion/taoism/zh-CN.ics` |
| `SRC-UN-FIXED-OBSERVANCES` | First 17 reviewed fixed-date observances from the United Nations directory | United Nations official directory | `scripts/generate-un-fixed-observances.py` | Public: `/ical/v1/global/un-fixed-observances/zh-CN.ics` |
| `SRC-UN-OBSERVANCES` | All international days and weeks listed by the United Nations; each date rule is reviewed before release | Pending editorial rule audit | CalRepo workbook `节日总表` | Data-review stage |
| `SRC-CATHOLIC` | General Roman Rite; annual liturgies and universal fixed observances | Liturgical Calendar API, Apache-2.0 | `scripts/generate-catholic-general-roman.py` | Public: `/ical/v1/religion/catholic-general-roman/en.ics` |
| `SRC-WORLD-SECULAR-CULTURE` | Widely observed secular cultural dates; excludes United Nations observances and statutory holidays | Pending editorial rule audit | CalRepo workbook `节日总表` | Data-review stage |
| `SRC-WORLD-PROFESSIONAL-INTEREST` | Professional and interest-community dates with a traceable origin page | Pending editorial rule audit | CalRepo workbook `节日总表` | Data-review stage |
| `SRC-WORLD-COMMERCIAL` | Retail promotion dates; clearly labelled as commercial, not statutory holidays | Pending editorial rule audit | CalRepo workbook `节日总表` | Data-review stage |

Han Buddhism excludes Tibetan Buddhism and Theravada Buddhism. Country-wide Southeast Asian Buddhist calendars must be separate sources; overseas Chinese Han Buddhist communities are part of the Han Buddhist scope.

## Provenance And Boundary

The first rules reference [`6tail/lunar-csharp`](https://gitee.com/6tail/lunar-csharp), an MIT-licensed lunar-calendar project with Buddhist and Daoist date tables. It is an implementation reference, not a claim that one institution publishes a universal official machine-readable religious calendar.

The first Han Buddhist source contains 22 core observances; the Daoist source contains 16. Both exclude monthly fasting days, taboos, Five Poisons Days, and local temple-specific observances. Every rule needs a date rule, tradition and geography, reference URL, license, reviewer, verification date, and known exclusions.

The United Nations source contains every project currently listed on the official Chinese and English United Nations International Days and Weeks pages. Each row retains the official detail URL, resolution/evidence URL when available, and the date displayed on the page. That displayed date is evidence, not yet a release rule: each row must be classified as fixed Gregorian, relative calculation, date range, or annual announcement before it can be generated or published.

The three global non-UN sources are deliberately separate: secular culture, professional/interest, and commercial promotion have different authority, scope, and user expectations. An entry must have a clear date rule and a traceable origin page. Their first intake is only editorial data; no row becomes a public ICS event until terminology, scope, generator support, and multi-year fixtures are reviewed.

## Maintenance Cadence

| Activity | Cadence | Early trigger |
| --- | --- | --- |
| Generated-date regression tests | Every rule or code change | Lunar conversion change |
| Rule and title review | Yearly before Chinese New Year | Credible correction from an association, temple, or school |
| Provenance and license review | Quarterly | Broken link, license or upstream change |
| Cross-year generated-date review | Before public release; previous year through five future years | Leap-month or date discrepancy |
| Public ICS availability review | Quarterly | Hosting or release-pipeline change |
| United Nations list and title review | Annually after the official list is reviewed | Official date, title, or scope change |

KeepOn may generate local events at startup or manual refresh. This is regeneration of stable rules, not a claim of daily external data updates.

## Religious And UN Public Releases

The Han Buddhist source contains 22 core dates and the Daoist source contains 16 core dates. Both use the .NET `ChineseLunisolarCalendar` over `Asia/Shanghai`, are released for 2025-2035, and skip a lunar day thirty when that lunar month has only twenty-nine days. They are not universal Buddhist or Daoist calendars.

The United Nations source is deliberately narrower than the complete UN directory: it contains only 17 reviewed, fixed Gregorian dates. Variable-date observances, international weeks and international years remain in `SRC-UN-OBSERVANCES` research and must not enter the fixed-date subscription without individual rule review.

The General Roman Calendar is generated for 2025-2035 from annual Liturgical Calendar API data plus Apache-2.0 universal fixed-observance data. It retains both an annual liturgy and a same-day universal fixed observance, for example the 27th Sunday in Ordinary Time and Saint Francis of Assisi on 2026-10-04. English titles are retained until a human-reviewed Catholic Chinese translation set exists.

## China Public Releases

Both China sources are generated for 2025-2035 and use `Asia/Shanghai`. The solar-term source is calculated from solar longitude. The traditional/public source uses the .NET `ChineseLunisolarCalendar` for lunar dates and a reviewed fixed-date rule set.

Within `SRC-CN-TRADITIONAL-PUBLIC`, each festival appears once. A `(法)` suffix identifies a statutory base date. Actual annual leave spans and adjusted workdays are not generated from a fixed rule: they require the State Council General Office annual notice. Qingming's seasonal event belongs to the solar-term source, while `清明节(法)` records the statutory status in the public-holiday source.

Release changes require generation, uniqueness checks, a 2025-2035 coverage check, review of sample Chinese titles, an entry in `CHANGELOG.md`, and a rollbackable Git release. Review both sources annually before Chinese New Year and immediately when an authoritative correction affects a rule.

## Required Change Workflow

1. Update the CalRepo source-catalogue row and evidence record.
2. Update `src/religious_calendars.py`, KeepOn source metadata, and the CalRepo workbook together.
3. Record scope, reference, exclusions, and the preceding task `log_id`.
4. Run known-date, lunar conversion, cross-year, Python, and JavaScript checks.
5. Review leap months, duplicates, titles, and exclusions.
6. Add changelog and task-log entries before release.

## Public Release Gate

`是否有订阅源` remains `否` until a directly usable public HTTPS ICS URL exists. `CalRepo 处理策略` may be `自建开源` and KeepOn may use the internal `calrepo://` source before then.

A public release requires a versioned URL, provenance metadata, declared license and attribution, multi-year fixtures, documented scope and exclusions, a changelog, and a rollbackable previous release.
