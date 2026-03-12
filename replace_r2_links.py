#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
将 source 目录中的 markdown 文件中的 https://your-r2-domain.com/ 替换为 /assets/
"""

import os

def replace_r2_links(directory):
    """
    遍历指定目录下的所有 markdown 文件，替换链接中的 https://assets.drwang.fun/
    
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
                    replacements = content.count('https://assets.drwang.fun/')
                    
                    if replacements > 0:
                        # 执行替换
                        new_content = content.replace('https://your-r2-domain.com/', '/assets/')
                        
                        # 写回文件
                        with open(filepath, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        
                        count_files += 1
                        count_replacements += replacements
                        print(f'✓ {filepath}: 替换了 {replacements} 处')
                
                except Exception as e:
                    print(f'✗ 处理文件 {filepath} 时出错: {e}')
    
    print(f'\n完成！共处理 {count_files} 个文件，替换了 {count_replacements} 处链接。')

if __name__ == '__main__':
    # 获取当前脚本所在目录
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # 目标目录为 source
    target_dir = os.path.join(current_dir, 'source')
    
    print(f'开始处理目录: {target_dir}')
    replace_r2_links(target_dir)
