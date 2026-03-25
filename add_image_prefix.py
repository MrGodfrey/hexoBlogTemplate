#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
将 source 目录中的 markdown 文件中的 {% img /assets/ 替换为带有完整前缀的图片地址。

通过环境变量 HEXO_IMAGE_PREFIX 配置前缀，例如：
HEXO_IMAGE_PREFIX=https://your-site.example.com/assets/
"""

import os
import re

def add_image_prefix(directory):
    """
    遍历指定目录下的所有 markdown 文件，为图片路径添加前缀
    
    Args:
        directory: 要处理的目录路径
    """
    count_files = 0
    count_replacements = 0
    
    # 匹配 {% img /assets/ 格式的图片标签
    # 使用正则表达式处理可能存在的多个空格
    prefix = os.environ.get('HEXO_IMAGE_PREFIX', 'https://your-site.example.com/assets/')
    prefix = prefix.rstrip('/') + '/'
    pattern = re.compile(r'\{%\s*img\s+/assets/')
    replacement = '{% img ' + prefix
    
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
                    
                    # 统计匹配次数
                    matches = len(pattern.findall(content))
                    
                    if matches > 0:
                        # 执行替换
                        new_content = pattern.sub(replacement, content)
                        
                        # 写回文件
                        with open(filepath, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        
                        count_files += 1
                        count_replacements += matches
                        print(f'✓ {filepath}: 替换了 {matches} 处')
                
                except Exception as e:
                    print(f'✗ 处理文件 {filepath} 时出错: {e}')
    
    print(f'\n完成！共处理 {count_files} 个文件，替换了 {count_replacements} 处图片路径。')

if __name__ == '__main__':
    # 获取当前脚本所在目录
    current_dir = os.path.dirname(os.path.abspath(__file__))
    # source 目录路径
    source_dir = os.path.join(current_dir, 'source')
    
    print(f'开始处理目录: {source_dir}')
    add_image_prefix(source_dir)
