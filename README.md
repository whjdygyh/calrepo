# CalRepo

CalRepo is a public, auditable directory of iCalendar subscription sources.

## Public Sources

| Source | Subscription URL | Coverage | Rule |
| --- | --- | --- | --- |
| Chinese 24 Solar Terms | `https://calrepo.com/ical/v1/cn/solar-terms/zh-CN.ics` | 2025-2035 | Solar longitude, Asia/Shanghai |
| Chinese Traditional Festivals and Public Holidays | `https://calrepo.com/ical/v1/cn/traditional-public/zh-CN.ics` | 2025-2035 | Chinese lunar rules plus fixed Gregorian dates |

The public-holiday source records statutory base dates only. Its `"(法)"` suffix marks a statutory event. Annual leave spans and adjusted workdays follow the State Council General Office's annual notice and are intentionally not inferred or fabricated.

## Editorial Data

- Baseline workbook: `data/seed/calendar-rules.xlsx`
- Workbook contract: `docs/design/calendar-rules-workbook.md`
- China completeness audit: `docs/analysis/china-traditional-public-calendar-completeness-audit-2026-07-25.md`
- Maintenance manual: `docs/design/self-built-calendar-source-maintenance.md`

The Excel workbook is the editorial baseline. The two user-created pivot sheets remain part of that workbook and must not be removed.

## Generation

```powershell
python scripts/generate-solar-terms.py
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/generate-china-traditional-public.ps1
```

Generated ICS files are versioned under `ical/v1/`. Validate event count, unique UIDs, date coverage, titles, and source IDs before publishing a change.

## Hosting

The static site is deployed through Cloudflare Pages at `calrepo.com`. ICS responses are served as `text/calendar; charset=utf-8`.
