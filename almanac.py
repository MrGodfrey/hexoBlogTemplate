#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
almanac.py

用法（在 Hexo 根目录）：
  python almanac.py --init
  python almanac.py --today
  python almanac.py --add 10-30 --year 2025
  python almanac.py --ensure 10-30
"""

import argparse
import datetime as dt
import os
import re
from typing import Optional
from zoneinfo import ZoneInfo

ROOT = os.path.abspath(os.path.dirname(__file__))
ALMANAC_DIR = os.path.join(ROOT, 'source', 'almanac')

FRONT_MATTER = """---\n{front}\n---\n\n"""

def zh_title(mm_dd: str) -> str:
    m, d = mm_dd.split('-')
    return f"{int(m)} 月 {int(d)} 日"

def md_path(mm_dd: str) -> str:
    return os.path.join(ALMANAC_DIR, f"{mm_dd}.md")

def ensure_dir():
    os.makedirs(ALMANAC_DIR, exist_ok=True)

def valid_key(mm_dd: str) -> bool:
    return bool(re.fullmatch(r"\d{2}-\d{2}", mm_dd))

def iter_all_keys():
    # 以 2000 年为日历，包含闰日
    start = dt.date(2000, 1, 1)
    end   = dt.date(2000, 12, 31)
    cur = start
    while cur <= end:
        yield f"{cur.month:02d}-{cur.day:02d}"
        cur += dt.timedelta(days=1)

def read_text(path: str) -> Optional[str]:
    if not os.path.exists(path):
        return None
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write_text(path: str, content: str):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

def append_text(path: str, content: str):
    with open(path, 'a', encoding='utf-8') as f:
        f.write(content)

def ensure_file(mm_dd: str):
    """若不存在则新建含 front-matter 的 md 文件"""
    path = md_path(mm_dd)
    if os.path.exists(path):
        return False
    fm = FRONT_MATTER.format(front=f"title: {zh_title(mm_dd)}\nlayout: almanac-day")
    write_text(path, fm)
    return True

def has_year_section(text: str, year: int) -> bool:
    # 粗匹配：## YYYY（可含空白）
    pattern = re.compile(rf"^##\s*{year}\s*$", re.MULTILINE)
    return bool(pattern.search(text))

def append_year_section(mm_dd: str, year: int):
    """在文件末尾追加一个年份段（若不存在）"""
    path = md_path(mm_dd)
    text = read_text(path) or ""
    if not text:
        ensure_file(mm_dd)
        text = read_text(path) or ""

    if has_year_section(text, year):
        return False

    # 保证文件末尾有一个换行
    if not text.endswith('\n'):
        text += '\n'

    # 追加年份段落（空一行再加）
    block = f"\n## {year}\n\n"
    append_text(path, block)
    return True

def today_key_berlin() -> tuple[str,int]:
    now = dt.datetime.now(ZoneInfo("Asia/Shanghai"))
    return f"{now.month:02d}-{now.day:02d}", now.year

def cmd_init():
    ensure_dir()
    created = 0
    for key in iter_all_keys():
        if ensure_file(key):
            created += 1
    print(f"[init] created {created} files under source/almanac/")

def cmd_today():
    ensure_dir()
    key, year = today_key_berlin()
    ensure_file(key)
    appended = append_year_section(key, year)
    print(f"[today] ensured {key}.md; year {year} " + ("appended" if appended else "exists"))

def cmd_add(mm_dd: str, year: int):
    if not valid_key(mm_dd):
        raise SystemExit(f"invalid key: {mm_dd}")
    ensure_dir()
    ensure_file(mm_dd)
    appended = append_year_section(mm_dd, year)
    print(f"[add] {mm_dd} year {year} " + ("appended" if appended else "exists"))

def cmd_ensure(mm_dd: str):
    if not valid_key(mm_dd):
        raise SystemExit(f"invalid key: {mm_dd}")
    ensure_dir()
    created = ensure_file(mm_dd)
    print(f"[ensure] {mm_dd} " + ("created" if created else "exists"))

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--init", action="store_true", help="create 366 stub md files")
    ap.add_argument("--today", action="store_true", help="ensure today's file and year section (Europe/Berlin)")
    ap.add_argument("--add", metavar="MM-DD", help="append a year section to a given day")
    ap.add_argument("--year", type=int, help="year to append with --add")
    ap.add_argument("--ensure", metavar="MM-DD", help="ensure a given day file exists")
    args = ap.parse_args()

    if args.init:
        cmd_init()
        return
    if args.today:
        cmd_today()
        return
    if args.add:
        if not args.year:
            raise SystemExit("--add requires --year YYYY")
        cmd_add(args.add, args.year)
        return
    if args.ensure:
        cmd_ensure(args.ensure)
        return

    ap.print_help()

if __name__ == "__main__":
    main()
