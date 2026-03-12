#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
将 source/_posts 目录中的 markdown 文件中的 ](/blog 替换为 ](
"""

import os
import re

def replace_blog_links(directory):
    """
    遍历指定目录下的所有 markdown 文件，替换链接中的 /blog
    
    Args:
        directory: 要处理的目录路径
    """
    count_files = 0
    count_replacements = 0
    
    # 遍历目录下的所有文件
    for root, dirs, files in os.walk(directory):
        for filename in files:
            # 只处理 .md 文件
            if filename.endswith('.md'):
                filepath = os.path.join(root, filename)
                
                try:
                    # 读取文件内容
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # 统计替换次数
                    replacements = content.count('](/blog')
                    
                    if replacements > 0:
                        # 执行替换
                        new_content = content.replace('](/blog', '](')
                        
                        # 写回文件
                        with open(filepath, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        
                        count_files += 1
                        count_replacements += replacements
                        print(f'✓ {filename}: 替换了 {replacements} 处')
                
                except Exception as e:
                    print(f'✗ 处理文件 {filename} 时出错: {e}')
    
    print(f'\n完成！共处理 {count_files} 个文件，替换了 {count_replacements} 处链接。')

if __name__ == '__main__':
    # 获取脚本所在目录
    script_dir = os.path.dirname(os.path.abspath(__file__))
    posts_dir = os.path.join(script_dir, 'source', '_posts')
    
    if os.path.exists(posts_dir):
        print(f'开始处理目录: {posts_dir}\n')
        replace_blog_links(posts_dir)
    else:
        print(f'错误: 目录不存在 {posts_dir}')
