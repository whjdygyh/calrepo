"""Generate CalRepo's fixed-date United Nations observances calendar."""

from __future__ import annotations

from datetime import date, datetime, timezone
from pathlib import Path

OBSERVANCES = (
    (2, 2, "世界湿地日", "World Wetlands Day"), (2, 11, "妇女和女童参与科学国际日", "International Day of Women and Girls in Science"),
    (2, 20, "世界社会公正日", "World Day of Social Justice"), (3, 8, "国际妇女节", "International Women's Day"),
    (3, 22, "世界水日", "World Water Day"), (4, 7, "世界卫生日", "World Health Day"),
    (4, 22, "国际地球母亲日", "International Mother Earth Day"), (5, 3, "世界新闻自由日", "World Press Freedom Day"),
    (5, 22, "国际生物多样性日", "International Day for Biological Diversity"), (6, 5, "世界环境日", "World Environment Day"),
    (6, 21, "国际瑜伽日", "International Day of Yoga"), (7, 30, "国际友谊日", "International Day of Friendship"),
    (8, 12, "国际青年日", "International Youth Day"), (9, 21, "国际和平日", "International Day of Peace"),
    (10, 1, "国际老年人日", "International Day of Older Persons"), (12, 1, "世界艾滋病日", "World AIDS Day"),
    (12, 10, "人权日", "Human Rights Day"),
)


def escape_ical(value: str) -> str:
    return value.replace("\\", "\\\\").replace(";", "\\;").replace(",", "\\,").replace("\n", "\\n")


def main() -> None:
    output = Path("ical/v1/global/un-fixed-observances/zh-CN.ics")
    lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//CalRepo//United Nations Fixed Observances//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", "X-WR-CALNAME:联合国固定日期纪念日", "X-WR-TIMEZONE:UTC", "X-CALREPO-SOURCE-ID:SRC-UN-FIXED-OBSERVANCES", "X-CALREPO-VERSION:2026.07.25"]
    for year in range(2025, 2036):
        for month, day, name_zh, name_en in OBSERVANCES:
            start = date(year, month, day)
            lines.extend(["BEGIN:VEVENT", f"UID:calrepo.un.fixed.{month:02d}{day:02d}.{year}@calrepo.com", "DTSTAMP:20260725T120000Z", f"DTSTART;VALUE=DATE:{start:%Y%m%d}", f"DTEND;VALUE=DATE:{date.fromordinal(start.toordinal() + 1):%Y%m%d}", f"SUMMARY:{escape_ical(name_zh)} | {escape_ical(name_en)}", "DESCRIPTION:United Nations fixed-date observance. Excludes variable-date observances, international weeks, and international years.", "CATEGORIES:United Nations observance", "END:VEVENT"])
    lines.extend(["END:VCALENDAR", ""])
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_bytes("\r\n".join(lines).encode("utf-8"))
    print(f"generated {(2035 - 2025 + 1) * len(OBSERVANCES)} events: {output}")


if __name__ == "__main__":
    main()
