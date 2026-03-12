# Hexo Blog

## 获取此博客模板

如果你没有任何 Git 基础，可以通过以下方式快速获取此项目：
**直接下载：** 在项目页面点击绿色的 "Code" 按钮，选择 "Download ZIP"。下载完成后，将其解压到你的本地文件夹中即可。

*如果你安装了 Git，也可以在终端执行：*
```bash
git clone <本仓库地址>
cd <你的文件夹名称>
```

## 快速开始（跑起来只需三步）

要让这个博客示例在本地成功跑起来，请依次完成以下三步操作：

### 1. 安装依赖

确保你已经安装了 Node.js。在终端（命令行）中进入当前项目根目录，运行以下命令：
```bash
npm install
```

### 2. 配置 Cloudflare R2 存储桶

本项目使用了 Cloudflare R2 作为配套图床存储，请按照以下步骤进行详细配置：
1. 注册并登录 [Cloudflare 控制台](https://dash.cloudflare.com/)。
2. 在左侧菜单栏选择 **R2**，点击 **创建存储桶 (Create bucket)** 并命名。
3. 记下你的**存储桶名称**和对应的**区域 (Location/Region)** 信息。
4. 返回 R2 概览页面，在右上方点击 **管理 R2 API 令牌**，生成具有读写权限的**账户 ID (Account ID)**、**访问密钥 ID (Access Key ID)** 和 **机密访问密钥 (Secret Access Key)**。
5. 在博客代码仓库根目录中，找到 `.env_template` 文件。打开它并将刚才获取到的配置信息对应填入。填好后，重命名此文件为 `.env`。

### 3. 初始化日记本页面

本项目包含自定义的日记本（Almanac）页面。在使用前，需要在根目录中执行以下命令进行初始化生成：
```bash
python3 almanac.py --init
```
*(注意：请确保你的电脑上已经安装了 Python 环境)*

---

## 本地预览（立即查看效果）

做完上面三件事之后，你现在可以立刻在本地预览你的博客效果了！
请在终端中运行以下命令：
```bash
hexo server
```
*(也可以使用简写命令 `hexo s`)*

当终端显示 `Hexo is running at http://localhost:4000/` 时，打开你的浏览器，访问 `http://localhost:4000` 即可马上看到你自己的博客啦！

---

## 部署上线到 GitHub Pages

当你在本地文章写好后，通常会推荐使用 GitHub Pages 将静态网页部署到公网，免费且稳定。以下是详细步骤：

### 1. 部署前准备
1. 登录 GitHub，新建一个**公开的 (Public)** 仓库，仓库名必须严格命名为：`<你的 GitHub 用户名>.github.io`。
2. 回到本地博客根目录，打开 `_config.yml` 配置文件。
3. 滑动到文件最底部，找到 `deploy:` 字段，将其修改为如下格式：
```yaml
deploy:
  type: git
  repo: https://github.com/<你的 GitHub 用户名>/<你的 GitHub 用户名>.github.io.git
  branch: main  # 或者填写 master
```
4. 如果还没装过部署插件，需要在终端运行以下命令安装：
```bash
npm install hexo-deployer-git --save
```

### 2. 一键发布
一切配置完毕后，你只需要依次运行：
```bash
hexo clean
hexo generate
hexo deploy
```
或者使用一键打包发布命令：
```bash
hexo d -g
```
等待命令执行完毕，几分钟后访问 `https://<你的 GitHub 用户名>.github.io` 就能向全世界展示你的博客了！

---

## 基本写作与操作命令

### 写作

```bash
hexo new "My New Post"
```
或者使用具体的 layout，比如新建一个关于页面：
```bash
hexo new page "about"
```

## 本地依赖脚本

如果由于需要在 Cloudflare R2 / 相册等相关图片存储库之间做链接转换，或者进行博客维护使用，仓库内包含一些 Python 和 Shell 脚本：
- `almanac.py`：生成或管理日记本（Almanac）时间。
- `replace_r2_links.py`：批量将 Markdown 文件里的 R2 域名替换为本地资源链接。
- `replace.py` 等批量替换/正则替换文本的工具脚本。