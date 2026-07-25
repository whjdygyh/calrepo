# Calendar Source Verification - 2026-07-22

## Scope

Test public Google Calendar holiday iCalendar endpoints for the countries and religions currently prioritized by CalRepo. Each request used the public `basic.ics` endpoint and verified HTTP status, `Content-Type`, and the count of `VEVENT` entries.

This is a technical availability check only. It does not establish data accuracy, legal permission to mirror or redistribute, long-term maintenance commitment, or complete event coverage.

## Result

| Group | Candidate count | HTTP 200 `text/calendar` | Failed |
| --- | ---: | ---: | ---: |
| China, Christianity, and 16 priority countries | 18 | 17 | 1 |

The 17 successful endpoints are recorded in `data/seed/calendar-rules.xlsx` under `日历源目录` as quality `C`: technically usable for users to subscribe directly, but not approved for CalRepo mirroring or redistribution.

## Successful Candidates

- China, Christianity, United States, Canada, Mexico, Brazil, Russia, France, United Kingdom, Germany, Japan, South Korea, India, Vietnam, Singapore, Malaysia, and Indonesia.
- Event counts ranged from 175 (Indonesia) to 535 (India) at verification time.

## Failed Candidate

- Thailand (`en.thai#holiday@group.v.calendar.google.com`) returned HTTP 500. It remains `待研究`; no subscription link is offered.
- Catholic (`en.catholic#holiday@group.v.calendar.google.com`) also returned HTTP 500. It is not a usable Catholic-specific subscription source.

## Recheck: Google Candidates

On 2026-07-22, the Thailand and Catholic candidates were each requested three consecutive times. Every request returned `HTTP 500`, `Content-Type: text/html; charset=utf-8`, and a 1,873-byte error page, rather than `text/calendar` or an iCalendar payload.

Both candidates are therefore classified as `Google 候选不可用`, not as intermittent failures. CalRepo must not publish either URL as a subscription link. The Google Christianity source remains separate: it is technically usable but is a composite Christian calendar, not a Catholic-specific calendar.

## Follow-up Research

The next research round found a technically usable non-Google Thailand endpoint at `https://www.officeholidays.com/ics-all/thailand`: HTTP 200, `text/calendar`, and 51 events across 2026-2027. It is an external direct-subscription candidate only; licence and redistribution rights remain unverified, so CalRepo must not mirror or republish it.

No Vatican/Holy See general Roman Catholic ICS endpoint was found. Vatican pages reviewed provide papal activity and papal-liturgical-celebration schedules, rather than a global Catholic feast-calendar subscription. The Holy See's `Mysterii Paschalis` remains a primary rule source for a future self-built General Roman Calendar. See `docs/analysis/thailand-catholic-source-research-2026-07-22.md` for the full evidence and self-build boundary.

## Decision

1. Use successful Google URLs only as direct, external subscription links.
2. Do not mirror, republish, or use them as CalRepo-hosted iCalendar output until licence and reuse rights are audited.
3. Build independent CalRepo sources only where rules, provenance, scope, and validation fixtures are sufficient.
4. Keep religion, ethnicity, and country variants separate at the event-row level, even for related festival families.

## Binary Status Recheck - 2026-07-23

The workbook now uses a deliberately simple rule for `是否有订阅源`: only `是` or `否` are valid values. The value means only whether a currently accessible iCalendar/ICS subscription URL was found. Official status, quality, completeness, licensing, and mirroring permission remain separate fields.

The follow-up search used English plus local-language terms for the relevant country or tradition. The following previously unresolved candidates now have usable subscription URLs and are marked `是`:

| Calendar | Result | URL | Verification |
| --- | --- | --- | --- |
| China 24 Solar Terms | `是` | `https://raw.githubusercontent.com/oooldtoy/chinese_calender/main/twenty_four_solar.ics` | HTTP 200, `text/calendar`, 72 events |
| Chinese Traditional Festivals | `是` | `https://raw.githubusercontent.com/oooldtoy/chinese_calender/main/festival.ics` | HTTP 200, `text/calendar`, 86 events |
| China statutory holidays and adjusted workdays | `是` | `https://yangh9.github.io/ChinaCalendar/cal_holiday.ics` | HTTP 200, `text/calendar`, 72 events |
| Thailand public holidays | `是` | `https://www.officeholidays.com/ics-all/thailand` | HTTP 200, `text/calendar`, 51 events across 2026-2027 |
| General Roman Catholic calendar | `是` | `https://litcal.johnromanodorazio.com/api/v5/calendar?return_type=ICS&year_type=CIVIL` | HTTP 200, `text/calendar`, 548 events for 2026 |
| Islam calendar | `是` | Google `en.islamic` public ICS | HTTP 200, `text/calendar`, 91 events |
| Greek Orthodox tradition | `是` | `https://129.158.245.227.nip.io/api/v1/saints.ics?tradition=greek&start=2026-01-01&days=365` | HTTP 200, `text/calendar`, 3,106 events |

The remaining unresolved items stay `否`: Anglican, Han Chinese Buddhism, Taoism, UN variable observances, general folk observances, and the ten Chinese ethnic-calendar entries. A source page or a known date rule is not itself an iCalendar subscription source.

These newly found sources are direct-use candidates only. They are not automatically official, complete, durable, or licensed for CalRepo mirroring. Each of those dimensions remains recorded separately for continued observation.
