# Hexo Blog

## 获取此博客模板

如果你没有任何 Git 基础，可以通过以下方式快速获取此项目：
**直接下载：** 在项目页面点击绿色的 "Code" 按钮，选择 "Download ZIP"。下载完成后，将其解压到你的本地文件夹中即可。

*如果你安装了 Git，也可以在终端执行（注意：请先 `cd` 到一个合适的位置，也就是你想存放这个项目文件夹的地方，不要直接在系统的根目录等地方直接操作）：*
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

本项目使用了 Cloudflare R2 作为配套图床存储。**为什么需要配置存储桶？** 是因为这个博客将存储桶作为图床使用，以便于之后将整个博客进行加密。所谓的“图床”作用在于：如果不加这个功能，Git 仓库就会因为存储了太多的图片文件而变得非常庞大。但在这个机制下，只要将所有图片先上传到存储桶中，文章文件之中就只会保留指向该云端图片的引用链接。需要注意的是，你的本地文件中依然是有图片保留的。

请按照以下步骤进行详细配置：
1. 注册并登录 [Cloudflare 控制台](https://dash.cloudflare.com/)。
2. 在左侧菜单栏找到 **Storage & databases**，选择其下的 **R2 object storage**。
3. 点击 **创建存储桶 (Create bucket)** 并命名。创建完成后，记下你的**存储桶名称**。
4. 返回 R2 概览页面，在右上方点击 **管理 R2 API 令牌 (Manage R2 API Tokens)**，生成具有读写权限的**账户 ID (Account ID)**、**访问密钥 ID (Access Key ID)** 和 **机密访问密钥 (Secret Access Key)**。
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

**注意：**如果你之前没有在电脑上全局安装过 Hexo CLI（即运行 `hexo` 命令时提示 `command not found`），你需要使用 `npx` 来调用项目中安装的本地依赖。后面的所有涉及 `hexo` 的命令同理。
> **💡 建议：**为了方便以后使用，你可以通过运行 npm install -g hexo-cli 来全局安装 Hexo。安装后，你就可以直接使用 `hexo` 而不需要每次加 `npx` 啦。

请在终端中运行以下命令：
```bash
npx hexo server
```
*(也可以使用简写命令 `npx hexo s`。如果你已经全局安装过 Hexo，直接使用 `hexo server` 即可)*

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
一切配置完毕后，你只需要依次运行（同样，如果没全局安装需加 `npx`）：
```bash
npx hexo clean
npx hexo generate
npx hexo deploy
```
或者使用一键打包发布命令：
```bash
npx hexo d -g
```
等待命令执行完毕，几分钟后访问 `https://<你的 GitHub 用户名>.github.io` 就能向全世界展示你的博客了！

---

## 基本写作与操作命令

### 写作

```bash
npx hexo new "My New Post"
```
或者使用具体的 layout，比如新建一个关于页面：
```bash
npx hexo new page "about"
```

### 插入图片

如果你使用的是 VS Code 编辑器，直接将图片拖进编辑器窗口即可。它会自动生成 Markdown 格式的图片引用，并且会自动将这个图片复制并保存到你的项目文件之中。

当你在此之后准备执行 `npx hexo s` 等命令进行预览或发布时，由于新增了本地图片没有上云，终端会提醒你需要先运行以下脚本：
```bash
node scripts/r2ify-sources.js
```
执行此命令是为了保证你的本地图片会被自动上传到之前配置好的 R2 服务器（图床）中。操作完成后即可正常运行后面的 Hexo 指令了。

**💡 进阶技巧：使用 Shell Alias 简化操作**

如果你觉得每次预览或部署前都要手动运行一遍脚本有些麻烦，可以在你的本地终端配置文件（如 `~/.zshrc` 或 `~/.bashrc`）中创建一个 Shell 函数，将这两个步骤合并，实现“一键自动上传并预览”。

打开你的终端配置文件（以 zsh 为例）：
```bash
nano ~/.zshrc
```

在文件末尾添加以下内容：
```bash
# Hexo 一键上传图片并启动本地服务器
hs() {
    node scripts/r2ify-sources.js
    npx hexo s
}

# 同样，也可以为一键部署配置快捷命令
hd() {
    node scripts/r2ify-sources.js
    npx hexo clean && npx hexo generate && npx hexo deploy
}
```

保存退出后，在终端运行 `source ~/.zshrc` 使配置生效。之后，当你插入了一张新图片想预览时，只需在项目根目录直接输入 `hs`，系统就会先自动运行上云脚本，紧接着启动本地服务器啦！



## 本地依赖脚本

如果由于需要在 Cloudflare R2 / 相册等相关图片存储库之间做链接转换，或者进行博客维护使用，仓库内包含一些 Python 和 Shell 脚本：
- `almanac.py`：生成或管理日记本（Almanac）时间。
- `replace_r2_links.py`：批量将 Markdown 文件里的 R2 域名替换为本地资源链接。
- `replace.py` 等批量替换/正则替换文本的工具脚本。
