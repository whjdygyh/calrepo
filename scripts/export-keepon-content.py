#!/usr/bin/env python3
"""Export reviewed KeepOn information-strip content from the Excel master."""

from __future__ import annotations

import argparse
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from xml.etree import ElementTree as ET
from zipfile import ZipFile


SPREADSHEET_NS = {"x": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
CELL_REF = re.compile(r"([A-Z]+)")
TYPE_MAP = {
    "历法知识": "calendar_knowledge",
    "节日知识": "festival_knowledge",
    "使用技巧": "usage_tip",
}


def column_number(reference: str) -> int:
    value = 0
    for character in CELL_REF.match(reference).group(1):
        value = value * 26 + ord(character) - ord("A") + 1
    return value


def text_value(cell: ET.Element, shared_strings: list[str]) -> str:
    raw = cell.findtext("x:v", default="", namespaces=SPREADSHEET_NS)
    if cell.get("t") == "s" and raw:
        return shared_strings[int(raw)]
    if cell.get("t") == "inlineStr":
        return "".join(cell.find("x:is", SPREADSHEET_NS).itertext())
    return raw


def read_master_rows(workbook_path: Path) -> list[dict[str, str]]:
    with ZipFile(workbook_path) as archive:
        shared_strings: list[str] = []
        if "xl/sharedStrings.xml" in archive.namelist():
            root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
            shared_strings = ["".join(item.itertext()) for item in root.findall("x:si", SPREADSHEET_NS)]
        sheet = ET.fromstring(archive.read("xl/worksheets/sheet1.xml"))

    rows: list[dict[int, str]] = []
    for row in sheet.findall(".//x:sheetData/x:row", SPREADSHEET_NS):
        values = {
            column_number(cell.get("r", "A1")): text_value(cell, shared_strings)
            for cell in row.findall("x:c", SPREADSHEET_NS)
        }
        if values:
            rows.append(values)

    header_row = next(row for row in rows if row.get(1) == "内容 ID")
    headers = {column: name for column, name in header_row.items()}
    return [{headers[column]: value for column, value in row.items() if column in headers} for row in rows[rows.index(header_row) + 1 :]]


def has_started(value: str, comparison: str) -> bool:
    return not value or value <= comparison


def has_not_ended(value: str, comparison: str) -> bool:
    return not value or value >= comparison


def export_items(rows: list[dict[str, str]], today: str) -> list[dict[str, object]]:
    items: list[dict[str, object]] = []
    for row in rows:
        if not row.get("内容 ID"):
            continue
        if row.get("审核状态") != "已审核" or row.get("发布状态") != "已发布":
            continue
        if not has_started(row.get("启用日期", ""), today):
            continue
        if not has_not_ended(row.get("停用日期", ""), today):
            continue
        try:
            weight = max(1, int(float(row.get("权重", "1") or 1)))
        except ValueError:
            weight = 1
        items.append(
            {
                "id": row["内容 ID"],
                "type": TYPE_MAP.get(row.get("内容类型", ""), "usage_tip"),
                "language": row.get("语言", "zh-CN"),
                "text": row.get("中文内容", ""),
                "tags": [tag.strip() for tag in row.get("主题标签", "").split(",") if tag.strip()],
                "related_feature": row.get("关联日历 / 功能", ""),
                "author": row.get("作者 / 来源", ""),
                "source_url": row.get("来源链接", ""),
                "trust_status": row.get("可信说明", ""),
                "weight": weight,
                "starts_at": row.get("启用日期", ""),
                "ends_at": row.get("停用日期", ""),
                "version": 1,
            }
        )
    return items


def main() -> None:
    repo_root = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, default=repo_root / "data" / "seed" / "keepon-content-library.xlsx")
    parser.add_argument("--output", type=Path, default=repo_root / "keepon" / "content" / "latest.json")
    parser.add_argument("--date", default=datetime.now(timezone.utc).date().isoformat())
    args = parser.parse_args()

    items = export_items(read_master_rows(args.input), args.date)
    if not items:
        raise SystemExit("No reviewed, published KeepOn content rows were available for export.")
    payload = {
        "schema_version": 1,
        "version": f"{args.date}-{len(items)}",
        "generated_at": datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
        "items": items,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Exported {len(items)} items to {args.output}")


if __name__ == "__main__":
    main()
