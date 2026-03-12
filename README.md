# Hexo Blog

## 安装

使用 `npm install` 安装依赖。

 

## 配置 Cloudflare R2 存储桶：
 
1. 登录 Cloudflare 控制台。
2. 选择 R2，然后创建一个新的存储桶。
3. 记下存储桶的名称和区域信息，在主页生成账户密钥和访问密钥等。在 git 仓库中修改.env_template 文件记录这些信息。
4. 将 .env_template 改为 .env

## 初始化日记本页面

在 Hexo 的根目录中执行以下命令：
```bash
python almanac.py --init
```


## 基本命令

### 写作

```bash
hexo new "My New Post"
```
或者使用具体的 layout，比如：
```bash
hexo new page "about"
```

### 生成与部署

一键生成静态文件：
```bash
hexo generate # 或 hexo g
```

部署（请确保 `_config.yml` 中已配置部署方式）：
```bash
hexo deploy # 或 hexo d
```

清除缓存：
```bash
hexo clean
```

## 本地依赖脚本

如果由于需要在 Cloudflare R2 / 相册等相关图片存储库之间做链接转换，或者进行博客维护使用，仓库内包含一些 Python 和 Shell 脚本：
- `almanac.py`：生成或管理日记本（Almanac）时间。
- `replace_r2_links.py`：批量将 Markdown 文件里的 R2 域名替换为本地资源链接。
- `replace.py` 等批量替换/正则替换文本的工具脚本。

使用 `hexo server` 或者 `hexo s` 启动本地服务器，访问 `http://localhost:4000` 进行本地预览。