# 使用方法 
# python tag.py [-h] [-r old_tag new_tag] [-d DELETE] [-c]
# Process .md files.

# options:
#   -h, --help            show this help message and exit
#   -r old_tag new_tag, --replace old_tag new_tag
#                         replace old_tag with new_tag
#   -d DELETE, --delete DELETE
#                         delete tag
#   -c, --count           count tags


import os
import argparse
from collections import defaultdict
import operator

def replace_tag(filepath, old_tag, new_tag):
    with open(filepath, 'r') as f:
        lines = f.readlines()

    with open(filepath, 'w') as f:
        in_front_matter = False
        for line in lines:
            if line.strip() == '---':
                in_front_matter = not in_front_matter

            if in_front_matter and line.strip().startswith('- ' + old_tag):
                f.write('- ' + new_tag + '\n')
            else:
                f.write(line)

def delete_tag(filepath, tag):
    with open(filepath, 'r') as f:
        lines = f.readlines()

    with open(filepath, 'w') as f:
        in_front_matter = False
        for line in lines:
            if line.strip() == '---':
                in_front_matter = not in_front_matter

            if not (in_front_matter and line.strip().startswith('- ' + tag)):
                f.write(line)

def count_tags(filepath, tag_count):
    with open(filepath, 'r') as f:
        lines = f.readlines()

    in_front_matter = False
    for line in lines:
        if line.strip() == '---':
            in_front_matter = not in_front_matter

        if in_front_matter and line.strip().startswith('- '):
            tag = line.strip()[2:]
            tag_count[tag] += 1


def process_files(replace, delete, count):
    """
    Processes markdown files in the './source/_posts' directory by replacing, deleting, or counting tags.
    Args:
        replace (tuple): A tuple containing two elements, the tag to be replaced and the new tag.
        delete (str): The tag to be deleted.
        count (bool): If True, counts the occurrences of each tag and prints them in descending order.
    Returns:
        None
    """
    tag_count = defaultdict(int)
    for root, _, files in os.walk('./source/_posts'):
        for file in files:
            if file.endswith('.md'):
                filepath = os.path.join(root, file)
                
                if replace:
                    replace_tag(filepath, replace[0], replace[1])
                
                if delete:
                    delete_tag(filepath, delete)
                
                if count:
                    count_tags(filepath, tag_count)

    if count:
        sorted_tags = sorted(tag_count.items(), key=operator.itemgetter(1), reverse=True)
        for tag, num in sorted_tags:
            print(f'{tag} {num}')

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Process .md files.')
    parser.add_argument('-r', '--replace', nargs=2, metavar=('old_tag', 'new_tag'), help='replace old_tag with new_tag')
    parser.add_argument('-d', '--delete', help='delete tag')
    parser.add_argument('-c', '--count', action='store_true', help='count tags')
    args = parser.parse_args()

    process_files(args.replace, args.delete, args.count)
