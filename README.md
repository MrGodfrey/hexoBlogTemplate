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

### 4. 可选：使用影评 / 书评 / 探店模板

这个模板已经内置了类似“豆瓣”的卡片展示页。只要文章带有以下标签之一，对应的标签页就会自动切换为卡片视图：

- `影评`
- `书评`
- `探店`

推荐直接使用项目自带的 scaffold：

```bash
npx hexo new movie "My Movie Review"
npx hexo new book "My Book Review"
npx hexo new tan "My Restaurant Review"
```

这些模板已经预置了以下字段：

- `rating`: 0 到 10 分，会自动渲染成 5 星样式
- `show_tags`: 卡片页的子分类筛选，例如“科幻”“小说”“咖啡馆”
- `city`: 仅探店卡片页使用，可按城市筛选
- `excerpt`: 卡片摘要文本

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

如果你准备配合 Cloudflare Pages Functions 对图片做同源代理，建议在 `.env` 中将 `R2_PUBLIC_BASE` 配置为：

```bash
R2_PUBLIC_BASE=/assets
```

这样上传脚本会把 Markdown 中的图片地址统一替换为 `/assets/...`，后续就能直接交给 Cloudflare Pages Functions 做受保护访问。

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

## 使用 Cloudflare 进行博客加密

如果你希望博客内容和图片都只能在登录后访问，推荐使用以下组合：

- Cloudflare Pages：托管 Hexo 静态站点
- Cloudflare Access：保护页面访问
- Cloudflare Pages Functions + R2 Bucket Binding：保护图片访问

### 1. 使用 Cloudflare Pages 部署站点

1. 将博客代码推送到 GitHub。
2. 在 Cloudflare Dashboard 中进入 `Workers & Pages`，导入现有 Git 仓库。
3. 构建命令填写：

```bash
hexo generate
```

4. 输出目录填写：

```bash
public
```

5. 在 Pages 项目的环境变量中添加时区，避免文章永久链接中的日期在云端构建时错乱：

```bash
TZ=Asia/Shanghai
```

### 2. 绑定自定义域名

1. 在 Pages 项目中打开 `Custom domains`。
2. 添加你的博客域名，例如 `blog.example.com`。
3. 按 Cloudflare 提示补齐对应的 DNS 记录。

### 3. 用 Cloudflare Access 保护博客页面

1. 打开 `Zero Trust`。
2. 进入 `Access` -> `Applications`，创建一个 `Self-hosted` 应用。
3. 受保护域名填写你的博客域名，例如 `blog.example.com`。
4. 在访问策略中指定允许登录的邮箱、邮箱域名或身份提供商。
5. 如果 Pages 还分配了默认的 `*.pages.dev` 域名，也要一并加上访问策略，否则别人仍然可以通过默认域名访问内容。

### 4. 用 Pages Functions 保护图片

模板已内置图片代理函数：

- `functions/assets/[[path]].js`

它的作用是：当访问 `/assets/...` 时，从 Cloudflare R2 读取对应对象并返回给浏览器。这样图片和网页保持同源，浏览器会自动携带 Cloudflare Access 的登录态，未登录用户无法直接读取图片。

配置步骤如下：

1. 在 Cloudflare Pages 项目的 `Settings` -> `Functions` -> `R2 bucket bindings` 中，添加一个绑定。
2. 绑定名称填写：

```bash
BUCKET
```

3. 在本地 `.env` 文件中保留以下配置：

```bash
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key-id
R2_SECRET_ACCESS_KEY=your-secret-access-key
R2_BUCKET=your-bucket-name
R2_KEY_PREFIX=posts
R2_PUBLIC_BASE=/assets
```

4. 之后运行：

```bash
node scripts/r2ify-sources.js
```

脚本会把本地文章资源上传到 R2，并将文章中的图片链接替换为 `/assets/...`。

### 5. 这一套方案为什么更安全

- 页面先经过 Cloudflare Access 鉴权，未登录请求不会拿到 HTML。
- 图片通过同源 `/assets/...` 路径访问，也会继承同样的访问控制。
- Pages Functions 通过 R2 Binding 在 Cloudflare 内部读取对象，不需要公开你的 R2 存储桶。
- 不需要额外处理图片跨域、Cookie 丢失或公开 CDN 泄露问题。
