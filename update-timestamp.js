#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

// 获取当前时间戳
function getTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const second = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

// 获取已暂存的 Markdown 文件
function getStagedMarkdownFiles() {
  try {
    const output = execSync('git diff --cached --name-only --diff-filter=ACMRT', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    });
    return output
      .split('\n')
      .filter(file => {
        // 仅处理 source 目录及其子路径下的 .md 文件
        return file.endsWith('.md') && 
               file.trim() !== '' && 
               file.startsWith('source/');
      });
  } catch (error) {
    return [];
  }
}

// 更新文件的 updated 字段
function updateFileTimestamp(filePath, timestamp) {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // 检测换行符类型
  const eol = content.includes('\r\n') ? '\r\n' : '\n';
  
  // 匹配 front matter
  const frontMatterRegex = /^---\s*[\r\n]+([\s\S]*?)[\r\n]+---\s*[\r\n]+([\s\S]*)$/;
  const match = content.match(frontMatterRegex);
  
  if (match) {
    // 存在 front matter
    let header = match[1];
    const body = match[2];
    
    // 去掉 header 末尾多余空白
    header = header.replace(/\s+$/, '');
    
    // 检查是否已存在 updated 字段
    if (/^updated\s*:/m.test(header)) {
      // 更新现有的 updated 字段
      header = header.replace(/^updated\s*:.*$/m, `updated: ${timestamp}`);
    } else if (/^date\s*:/m.test(header)) {
      // 在 date 字段后插入 updated
      header = header.replace(/^date\s*:.*$/m, `$&${eol}updated: ${timestamp}`);
    } else {
      // 在 header 开头添加 updated
      header = `updated: ${timestamp}${eol}${header}`;
    }
    
    // 重建文件内容
    content = `---${eol}${header}${eol}---${eol}${body}`;
  } else if (content.startsWith('---')) {
    // 有起始 --- 但没有结束 ---，创建新的 front matter
    content = `---${eol}updated: ${timestamp}${eol}---${eol}${content}`;
  } else {
    // 没有 front matter，创建新的
    content = `---${eol}updated: ${timestamp}${eol}---${eol}${content}`;
  }
  
  fs.writeFileSync(filePath, content, 'utf8');
  return true;
}

// 主函数
function main() {
  const files = getStagedMarkdownFiles();
  
  if (files.length === 0) {
    process.exit(0);
  }
  
  const timestamp = getTimestamp();
  let updatedCount = 0;
  
  files.forEach(file => {
    if (updateFileTimestamp(file, timestamp)) {
      // 将修改后的文件重新添加到暂存区
      try {
        execSync(`git add -- "${file}"`, { stdio: 'ignore' });
        updatedCount++;
      } catch (error) {
        console.error(`Failed to stage ${file}`);
      }
    }
  });
  
  if (updatedCount > 0) {
    console.log(`[pre-commit] Updated timestamp: ${timestamp} (${updatedCount} file${updatedCount > 1 ? 's' : ''})`);
  }
}

main();
