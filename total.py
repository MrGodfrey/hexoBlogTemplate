import os
import re
import argparse
from collections import defaultdict
from datetime import datetime

def extract_date_from_md(file_path):
    """从markdown文件中提取日期"""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
            # 查找date: YYYY-MM-DD或YYYY-M-D格式的日期
            date_match = re.search(r'date:\s*(\d{4})-(\d{1,2})-(\d{1,2})', content)
            if date_match:
                year, month, day = date_match.groups()
                return year, f"{year}-{month.zfill(2)}-{day.zfill(2)}"
    except Exception as e:
        print(f"读取文件 {file_path} 时出错: {e}")
    return None, None

def extract_title_from_md(file_path):
    """从markdown文件中提取标题"""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
            title_match = re.search(r'title:\s*(.+)', content)
            if title_match:
                return title_match.group(1).strip()
    except Exception as e:
        print(f"读取文件 {file_path} 时出错: {e}")
    return None

def merge_all_md_files(source_dir, output_dir):
    """将所有markdown文件汇总到一个文件中"""
    # 创建输出目录
    os.makedirs(output_dir, exist_ok=True)
    
    all_files = []
    
    # 遍历所有markdown文件
    for filename in os.listdir(source_dir):
        if filename.endswith('.md'):
            file_path = os.path.join(source_dir, filename)
            year, full_date = extract_date_from_md(file_path)
            title = extract_title_from_md(file_path)
            
            all_files.append({
                'filename': filename,
                'filepath': file_path,
                'date': full_date or '未知日期',
                'title': title or filename[:-3],
                'year': year or '未分类'
            })
    
    # 按日期排序文件
    all_files.sort(key=lambda x: x['date'] if x['date'] != '未知日期' else '0000-00-00')
    
    # 创建汇总文件
    output_file = os.path.join(output_dir, "全部文章汇总.md")
    
    with open(output_file, 'w', encoding='utf-8') as outfile:
        outfile.write("# 全部文章汇总\n\n")
        outfile.write(f"总计: **{len(all_files)}** 篇文章\n\n")
        
        if all_files:
            years = sorted(list(set([f['year'] for f in all_files if f['year'] != '未分类'])))
            if years:
                outfile.write(f"时间跨度: {years[0]}年 - {years[-1]}年\n\n")
        
        # 创建文章目录
        outfile.write("## 文章目录\n\n")
        for i, file_info in enumerate(all_files, 1):
            outfile.write(f"{i}. [{file_info['title']}](#{i}-{file_info['filename'][:-3].replace(' ', '-').replace('/', '-')}) - {file_info['date']}\n")
        
        outfile.write("\n---\n\n")
        
        # 添加文章内容
        for i, file_info in enumerate(all_files, 1):
            try:
                with open(file_info['filepath'], 'r', encoding='utf-8') as infile:
                    content = infile.read()
                    outfile.write(f"## {i}. {file_info['title']}\n\n")
                    outfile.write(f"**文件名**: {file_info['filename']}\n")
                    outfile.write(f"**日期**: {file_info['date']}\n")
                    outfile.write(f"**年份**: {file_info['year']}\n\n")
                    outfile.write("### 内容\n\n")
                    outfile.write(content)
                    outfile.write('\n\n---\n\n')
            except Exception as e:
                print(f"处理文件 {file_info['filename']} 时出错: {e}")
    
    print(f"所有 {len(all_files)} 篇文章已汇总到 {output_file}")

def merge_md_files_by_year(source_dir, output_dir):
    """按年份汇总markdown文件"""
    # 创建输出目录
    os.makedirs(output_dir, exist_ok=True)
    
    # 按年份分组文件
    files_by_year = defaultdict(list)
    
    # 遍历所有markdown文件
    for filename in os.listdir(source_dir):
        if filename.endswith('.md'):
            file_path = os.path.join(source_dir, filename)
            year, full_date = extract_date_from_md(file_path)
            title = extract_title_from_md(file_path)
            
            if year:
                files_by_year[year].append({
                    'filename': filename,
                    'filepath': file_path,
                    'date': full_date,
                    'title': title or filename[:-3]  # 如果没有标题，用文件名
                })
            else:
                files_by_year['未分类'].append({
                    'filename': filename,
                    'filepath': file_path,
                    'date': None,
                    'title': title or filename[:-3]
                })
    
    # 生成总的统计信息
    total_files = sum(len(files) for files in files_by_year.values())
    years = sorted([year for year in files_by_year.keys() if year != '未分类'])
    
    # 创建总览文件
    overview_file = os.path.join(output_dir, "文章汇总总览.md")
    with open(overview_file, 'w', encoding='utf-8') as outfile:
        outfile.write("# 博客文章汇总总览\n\n")
        outfile.write(f"总计: **{total_files}** 篇文章\n\n")
        outfile.write(f"时间跨度: {years[0]}年 - {years[-1]}年\n\n")
        outfile.write("## 各年份文章数量统计\n\n")
        
        for year in years:
            count = len(files_by_year[year])
            outfile.write(f"- **{year}年**: {count} 篇文章\n")
        
        if '未分类' in files_by_year:
            outfile.write(f"- **未分类**: {len(files_by_year['未分类'])} 篇文章\n")
        
        outfile.write("\n## 汇总文件列表\n\n")
        for year in years:
            outfile.write(f"- [{year}年汇总](./{year}年汇总.md)\n")
        if '未分类' in files_by_year:
            outfile.write(f"- [未分类文章汇总](./未分类年汇总.md)\n")
    
    # 为每个年份创建汇总文件
    for year, files in files_by_year.items():
        output_file = os.path.join(output_dir, f"{year}年汇总.md")
        
        # 按日期排序文件
        files.sort(key=lambda x: x['date'] if x['date'] else '0000-00-00')
        
        with open(output_file, 'w', encoding='utf-8') as outfile:
            outfile.write(f"# {year}年文章汇总\n\n")
            outfile.write(f"共计 **{len(files)}** 篇文章\n\n")
            
            # 创建文章目录
            outfile.write("## 文章目录\n\n")
            for i, file_info in enumerate(files, 1):
                date_str = file_info['date'] if file_info['date'] else '未知日期'
                outfile.write(f"{i}. [{file_info['title']}](#{i}-{file_info['filename'][:-3].replace(' ', '-').replace('/', '-')}) - {date_str}\n")
            
            outfile.write("\n---\n\n")
            
            # 添加文章内容
            for i, file_info in enumerate(files, 1):
                try:
                    with open(file_info['filepath'], 'r', encoding='utf-8') as infile:
                        content = infile.read()
                        outfile.write(f"## {i}. {file_info['title']}\n\n")
                        outfile.write(f"**文件名**: {file_info['filename']}\n")
                        outfile.write(f"**日期**: {file_info['date'] or '未知'}\n\n")
                        outfile.write("### 内容\n\n")
                        outfile.write(content)
                        outfile.write('\n\n---\n\n')
                except Exception as e:
                    print(f"处理文件 {file_info['filename']} 时出错: {e}")
        
        print(f"{year}年的 {len(files)} 篇文章已汇总到 {output_file}")

# 主函数
def main():
    # 设置命令行参数解析
    parser = argparse.ArgumentParser(description='汇总markdown文章')
    parser.add_argument('-y', '--by-year', action='store_true', 
                        help='按年份分别汇总文章（默认为汇总所有文章到一个文件）')
    parser.add_argument('--source', default='/Users/wangyu/code/blog/source/_posts',
                        help='源文件目录（默认: /Users/wangyu/code/blog/source/_posts）')
    parser.add_argument('--output', default='/Users/wangyu/code/blog/sum',
                        help='输出目录（默认: /Users/wangyu/code/blog/sum）')
    
    args = parser.parse_args()
    
    # 根据参数决定汇总方式
    if args.by_year:
        print("正在按年份汇总文章...")
        merge_md_files_by_year(args.source, args.output)
        print("所有文章已按年份完成汇总！")
        print(f"请查看总览文件: {args.output}/文章汇总总览.md")
    else:
        print("正在将所有文章汇总到一个文件...")
        merge_all_md_files(args.source, args.output)
        print("所有文章已汇总完成！")
        print(f"请查看汇总文件: {args.output}/全部文章汇总.md")

if __name__ == "__main__":
    main()