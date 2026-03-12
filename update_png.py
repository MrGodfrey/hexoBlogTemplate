import os
import re
import glob

# --- 配置 ---
# 要搜索的根目录
ROOT_DIR = 'source/_posts'
# --- 结束配置 ---

def process_files():
    """
    遍历目录，查找 .md 文件并处理它们。
    """
    
    # 1. 定义正则表达式
    #    这个正则表达式会捕获两部分：
    #    - 组 1: ({% asset_img [文件名部分]) - 例如：{% asset_img my-image
    #    - (匹配 .png)
    #    - 组 2: (\s+".*?"\s*%}) - 例如： "some 'description'" %}
    #
    #    我们用 \g<1>.jpg\g<2> 来替换，巧妙地只改变扩展名。
    pattern = re.compile(r'({% asset_img \S+)\.png(\s+".*?"\s*%})')

    # 统计数据
    total_files_processed = 0
    total_files_changed = 0
    total_replacements = 0

    print(f"--- 开始扫描 {ROOT_DIR} 中的 .md 文件 ---")

    # 2. 递归查找所有 .md 文件
    #    os.path.join(ROOT_DIR, '**', '*.md') 会创建一个像 'source/_post/**/*.md' 的路径
    #    recursive=True 使得 '**' 能匹配所有子目录
    search_path = os.path.join(ROOT_DIR, '**', '*.md')
    markdown_files = glob.glob(search_path, recursive=True)

    if not markdown_files:
        print(f"在 {ROOT_DIR} 中没有找到任何 .md 文件。")
        return

    # 3. 遍历和处理每个文件
    for filepath in markdown_files:
        total_files_processed += 1
        try:
            # 4. 读取文件内容
            with open(filepath, 'r', encoding='utf-8') as file:
                content = file.read()
            
            # 5. 执行替换
            #    re.subn() 会返回一个元组：(替换后的新字符串, 替换次数)
            new_content, num_subs = pattern.subn(r'\g<1>.jpg\g<2>', content)
            
            # 6. 检查是否有变化，如果有，则写回文件
            if num_subs > 0:
                with open(filepath, 'w', encoding='utf-8') as file:
                    file.write(new_content)
                
                print(f"[已更新] {filepath} (替换了 {num_subs} 处)")
                total_files_changed += 1
                total_replacements += num_subs
            # else:
                # print(f"[已检查] {filepath} (无需更改)") # 可以取消注释来查看所有文件

        except Exception as e:
            print(f"[ 错误 ] 处理 {filepath} 时出错: {e}")

    # 7. 打印总结报告
    print("\n--- 处理完成 ---")
    print(f"总共检查文件数: {total_files_processed}")
    print(f"总共修改文件数: {total_files_changed}")
    print(f"总共替换次数:   {total_replacements}")

# --- 运行脚本 ---
if __name__ == "__main__":
    # 确保脚本在正确的目录下运行，或者 ROOT_DIR 是绝对路径
    # 为安全起见，我们假设 source/_post 在脚本运行的当前目录中
    if not os.path.isdir(ROOT_DIR):
        print(f"错误：找不到目录 '{ROOT_DIR}'。")
        print("请确保你在正确的目录下运行此脚本，或者修改脚本中的 ROOT_DIR 变量。")
    else:
        process_files()