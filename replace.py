import re
import urllib.parse
import sys
import os

def replace_encoded_string(match):
    encoded_string = match.group(1)
    decoded_string = urllib.parse.unquote(encoded_string)
    base_name = os.path.splitext(decoded_string)[0]
    # 将所有非jpg后缀的图片文件改为jpg
    if not decoded_string.lower().endswith('.jpg'):
        decoded_string = base_name + '.jpg'
    return '{% asset_img ' + decoded_string + ' "' + base_name + ' \'' + base_name + '\'" %}'

with open(sys.argv[1], 'r+') as f:
    content = f.read()
    content = re.sub(r'!\[alt text\]\([^)]*\/([^)]*)\)', replace_encoded_string, content)
    content = re.sub(r'!\[Alt text\]\([^)]*\/([^)]*)\)', replace_encoded_string, content)
    f.seek(0)
    f.write(content)
    f.truncate()
