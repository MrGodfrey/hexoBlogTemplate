import os
import re
import argparse
from collections import defaultdict

"""
This script counts the number of Markdown files in a specified directory that contain a specific date pattern 
and calculates their total word count.

Usage:
    python countNumber.py <year>

Arguments:
    year (int): The year to search for in the date pattern (e.g., 2023).

Command Line Arguments:
    year: The year to search for in the date pattern (e.g., 2023).

Example:
    python countNumber.py 2023

Description:
    - The script searches for Markdown files in the specified folder path.
    - It looks for lines that match the pattern "date: yyyy-xx-xx" where yyyy is the specified year.
    - It counts the number of files that match the pattern and calculates the total word count of these files.
    - If the specified directory does not exist, it prints an error message.
    - If there is a permission error or if the specified path is a directory, it prints an appropriate error message.

Variables:
    folder_path (str): The path to the folder containing the Markdown files.
    pattern (str): The regular expression pattern to match the date in the specified year.
    count (int): The number of files that match the date pattern.
    total_word_count (int): The total word count of the files that match the date pattern.

Exceptions:
    - FileNotFoundError: If the specified directory does not exist.
"""

# 设置命令行参数解析
parser = argparse.ArgumentParser(description="Count Markdown files with a specific date pattern and their word count.")
parser.add_argument("year", type=int, help="The year to search for in the date pattern (e.g., 2023).")
args = parser.parse_args()

folder_path = "source/_posts"  # 替换为你的文件夹路径
date_pattern = rf"date: {args.year}-\d{{2}}-\d{{2}}"  # 匹配以 "date: yyyy-xx-xx" 格式开头的行
tag_pattern = re.compile(r'tags:\s*\n((?:\s*-\s[^\-].*\n)+)')  # 改进后的标签模式，只匹配单个 -

count = 0
total_word_count = 0
tag_count = defaultdict(int)

try:
    for entry in os.scandir(folder_path):
        if entry.is_file() and entry.name.endswith(".md"):
            try:
                with open(entry.path, "r", encoding="utf-8") as file:
                    content = file.read()
                    if re.search(date_pattern, content):
                        count += 1
                        total_word_count += len(content)
                        
                        # 统计标签数量
                        matches = tag_pattern.findall(content)
                        for match in matches:
                            tags = match.strip().split('\n')
                            for tag in tags:
                                tag_name = tag.strip('- ').strip()
                                tag_count[tag_name] += 1
            except Exception as e:
                print(f"Error reading file {entry.name}: {e}")
except FileNotFoundError:
    print(f"Error: The directory '{folder_path}' does not exist.")
except PermissionError:
    print(f"Error: You do not have permission to access '{folder_path}'.")
except IsADirectoryError:
    print(f"Error: '{folder_path}' is a directory, not a file.")

print(f"在{args.year}年的文件数量为: {count}")
print(f"在{args.year}年的文件总字数为: {total_word_count}")
print("标签统计:")
for tag, count in tag_count.items():
    print(f'{tag}: {count}')
