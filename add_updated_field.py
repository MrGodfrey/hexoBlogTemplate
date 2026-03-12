#!/usr/bin/env python3
"""
为 source/_posts 目录下的 Markdown 文件添加/更新 updated 字段
将所有文件的 updated 字段值设置为与 date 相同
"""

import os
import re
from pathlib import Path


def parse_front_matter(content):
    """解析 Markdown 文件的 front matter"""
    # 匹配 front matter (以 --- 开始和结束)
    pattern = r'^---\s*\n(.*?)\n---\s*\n'
    match = re.match(pattern, content, re.DOTALL)
    
    if not match:
        return None, None, content
    
    front_matter = match.group(1)
    front_matter_end = match.end()
    
    return front_matter, front_matter_end, content


def has_updated_field(front_matter):
    """检查 front matter 是否已有 updated 字段"""
    return re.search(r'^updated:\s*.+$', front_matter, re.MULTILINE) is not None


def get_date_value(front_matter):
    """从 front matter 中提取 date 字段的值"""
    match = re.search(r'^date:\s*(.+)$', front_matter, re.MULTILINE)
    if match:
        return match.group(1).strip()
    return None


def update_or_add_updated_field(content, front_matter, front_matter_end, date_value):
    """在 front matter 中更新或添加 updated 字段"""
    # 检查是否已有 updated 字段
    if has_updated_field(front_matter):
        # 替换现有的 updated 字段
        new_front_matter = re.sub(
            r'^updated:\s*.+$',
            f'updated: {date_value}',
            front_matter,
            count=1,
            flags=re.MULTILINE
        )
    else:
        # 在 date 字段后面添加 updated 字段
        new_front_matter = re.sub(
            r'^(date:\s*.+)$',
            rf'\1\nupdated: {date_value}',
            front_matter,
            count=1,
            flags=re.MULTILINE
        )
    
    # 重新组装文件内容
    new_content = f"---\n{new_front_matter}\n---\n{content[front_matter_end:]}"
    return new_content


def process_file(file_path):
    """处理单个 Markdown 文件"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        front_matter, front_matter_end, _ = parse_front_matter(content)
        
        if front_matter is None:
            print(f"⚠️  跳过 {file_path.name}: 没有找到 front matter")
            return False
        
        date_value = get_date_value(front_matter)
        if date_value is None:
            print(f"⚠️  跳过 {file_path.name}: 没有找到 date 字段")
            return False
        
        had_updated = has_updated_field(front_matter)
        
        # 更新或添加 updated 字段
        new_content = update_or_add_updated_field(content, front_matter, front_matter_end, date_value)
        
        # 写回文件
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        action = "更新" if had_updated else "添加"
        print(f"✓  已{action} {file_path.name}: updated: {date_value}")
        return True
        
    except Exception as e:
        print(f"❌ 处理 {file_path.name} 时出错: {e}")
        return False


def main():
    """主函数"""
    posts_dir = Path('source/_posts')
    
    if not posts_dir.exists():
        print(f"❌ 目录不存在: {posts_dir}")
        return
    
    # 获取所有 Markdown 文件
    md_files = list(posts_dir.glob('*.md'))
    
    if not md_files:
        print(f"⚠️  在 {posts_dir} 中没有找到 Markdown 文件")
        return
    
    print(f"找到 {len(md_files)} 个 Markdown 文件\n")
    
    updated_count = 0
    for md_file in sorted(md_files):
        if process_file(md_file):
            updated_count += 1
    
    print(f"\n完成！共更新了 {updated_count} 个文件")


if __name__ == '__main__':
    main()
