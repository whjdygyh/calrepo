"""Generate CalRepo's Chinese 24-solar-terms ICS release."""

from __future__ import annotations

import argparse
import json
import math
from datetime import datetime, timedelta, timezone
from pathlib import Path

SOLAR_TERMS = (
    ("\u5c0f\u5bd2", "Minor Cold", 285), ("\u5927\u5bd2", "Major Cold", 300),
    ("\u7acb\u6625", "Start of Spring", 315), ("\u96e8\u6c34", "Rain Water", 330),
    ("\u60ca\u86f0", "Awakening of Insects", 345), ("\u6625\u5206", "Spring Equinox", 0),
    ("\u6e05\u660e", "Clear and Bright", 15), ("\u8c37\u96e8", "Grain Rain", 30),
    ("\u7acb\u590f", "Start of Summer", 45), ("\u5c0f\u6ee1", "Grain Full", 60),
    ("\u8292\u79cd", "Grain in Ear", 75), ("\u590f\u81f3", "Summer Solstice", 90),
    ("\u5c0f\u6691", "Minor Heat", 105), ("\u5927\u6691", "Major Heat", 120),
    ("\u7acb\u79cb", "Start of Autumn", 135), ("\u5904\u6691", "Limit of Heat", 150),
    ("\u767d\u9732", "White Dew", 165), ("\u79cb\u5206", "Autumnal Equinox", 180),
    ("\u5bd2\u9732", "Cold Dew", 195), ("\u971c\u964d", "Frost's Descent", 210),
    ("\u7acb\u51ac", "Start of Winter", 225), ("\u5c0f\u96ea", "Minor Snow", 240),
    ("\u5927\u96ea", "Major Snow", 255), ("\u51ac\u81f3", "Winter Solstice", 270),
)


def signed_angle_difference(value: float, target: float) -> float:
    return (value - target + 180) % 360 - 180


def delta_t_seconds(year: int) -> float:
    offset = year - 2000
    return 62.92 + 0.32217 * offset + 0.005589 * offset**2


def apparent_solar_longitude(julian_day_utc: float, year: int) -> float:
    julian_day_tt = julian_day_utc + delta_t_seconds(year) / 86400
    centuries = (julian_day_tt - 2451545.0) / 36525
    mean_longitude = (280.46646 + 36000.76983 * centuries + 0.0003032 * centuries**2) % 360
    mean_anomaly = math.radians((357.52911 + 35999.05029 * centuries - 0.0001537 * centuries**2) % 360)
    equation_of_center = (math.sin(mean_anomaly) * (1.914602 - 0.004817 * centuries - 0.000014 * centuries**2)
                          + math.sin(2 * mean_anomaly) * (0.019993 - 0.000101 * centuries)
                          + math.sin(3 * mean_anomaly) * 0.000289)
    omega = math.radians(125.04 - 1934.136 * centuries)
    return (mean_longitude + equation_of_center - 0.00569 - 0.00478 * math.sin(omega)) % 360


def solar_terms_for_year(year: int) -> list[dict[str, object]]:
    first_guess = datetime(year, 1, 5, tzinfo=timezone(timedelta(hours=8))).astimezone(timezone.utc).timestamp() / 86400 + 2440587.5
    terms = []
    for index, (name_zh, name_en, longitude) in enumerate(SOLAR_TERMS):
        julian_day = first_guess + index * 15 / 0.98564736
        for _ in range(8):
            difference = signed_angle_difference(apparent_solar_longitude(julian_day, year), longitude)
            derivative = signed_angle_difference(apparent_solar_longitude(julian_day + 0.02, year), apparent_solar_longitude(julian_day - 0.02, year)) / 0.04
            julian_day -= difference / derivative
        instant = datetime(1970, 1, 1, tzinfo=timezone.utc) + timedelta(days=julian_day - 2440587.5)
        terms.append({"name_zh": name_zh, "name_en": name_en, "longitude": longitude, "date": instant.astimezone(timezone(timedelta(hours=8))).date().isoformat()})
    return terms


def escape_ical(value: str) -> str:
    return value.replace("\\", "\\\\").replace(";", "\\;").replace(",", "\\,").replace("\n", "\\n")


def build_ics(events: list[dict[str, str]]) -> str:
    lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//CalRepo//China Calendar Sources//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", "X-WR-CALNAME:中国二十四节气", "X-WR-TIMEZONE:Asia/Shanghai", "X-CALREPO-SOURCE-ID:SRC-CN-24-SOLAR-TERMS", "X-CALREPO-VERSION:2026.07.25"]
    for event in events:
        lines.extend(["BEGIN:VEVENT", f"UID:{event['uid']}", "DTSTAMP:20260725T080000Z", f"DTSTART;VALUE=DATE:{event['date'].replace('-', '')}", f"SUMMARY:{escape_ical(event['summary'])}", f"DESCRIPTION:{escape_ical(event['description'])}", f"CATEGORIES:{escape_ical(event['category'])}", "END:VEVENT"])
    return "\r\n".join(lines + ["END:VCALENDAR", ""])


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, default=Path("ical/v1/cn/solar-terms/zh-CN.ics"))
    parser.add_argument("--json-output", type=Path, default=Path("tmp/solar-terms.json"))
    parser.add_argument("--start-year", type=int, default=2025)
    parser.add_argument("--end-year", type=int, default=2035)
    args = parser.parse_args()
    all_terms = [term | {"year": year} for year in range(args.start_year, args.end_year + 1) for term in solar_terms_for_year(year)]
    events = [{"uid": f"calrepo.cn.solar-terms.{term['date']}@calrepo.com", "date": str(term["date"]), "summary": f"{term['name_zh']} | {term['name_en']}", "description": f"中国二十四节气；太阳黄经 {term['longitude']}°；中国标准时间。CalRepo source: SRC-CN-24-SOLAR-TERMS.", "category": "中国二十四节气"} for term in all_terms]
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_bytes(build_ics(events).encode("utf-8"))
    args.json_output.parent.mkdir(parents=True, exist_ok=True)
    args.json_output.write_text(json.dumps(all_terms, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"generated {len(events)} solar-term events: {args.output}")


if __name__ == "__main__":
    main()
