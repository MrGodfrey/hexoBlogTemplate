# Hexo Blog Template

<p align="center">
  <a href="https://hexoblogtemplate.pages.dev/">
    <img src="https://img.shields.io/badge/Demo-hexoblogtemplate.pages.dev-f97316?logo=cloudflarepages&logoColor=white" alt="Demo">
  </a>
  <a href="https://github.com/tufu9441/maupassant-hexo">
    <img src="https://img.shields.io/badge/Theme-Maupassant-111827?logo=hexo&logoColor=white" alt="Theme">
  </a>
  <a href="https://hexoblogtemplate.pages.dev/">
    <img src="https://img.shields.io/badge/Review%20Cards-Douban%20Style-16a34a?logo=bookstack&logoColor=white" alt="Review Cards">
  </a>
</p>

## 为什么用这个模板

如果你想要一个适合长期写作、视觉上克制、又不至于千篇一律的 Hexo 博客，这个模板会是一个很省心的起点。

它最突出的地方，在于把真正高频、真正会长期使用的那部分体验先做好：

- 整体页面布局克制、干净，适合长文章阅读，不会让内容被过度装饰抢走注意力
- 影评 / 书评 / 探店已经内置类似豆瓣的条目卡片展示，特别适合做持续积累型的内容整理
- 普通文章、Almanac、Journal 这几类内容入口已经分开，后期扩写不容易乱
- 默认就能直接本地预览、部署到 GitHub Pages 或 Cloudflare Pages，不强绑图床或额外云服务

示例页面：

- [在线预览](https://hexoblogtemplate.pages.dev/)

这个模板基于 `maupassant` 主题做了定制和扩展。`maupassant` 本身就是 Hexo 里很经典、也很耐看的简洁主题，这里也特别感谢 [tufu9441](https://github.com/tufu9441) 和原始的 [maupassant-hexo](https://github.com/tufu9441/maupassant-hexo) 项目。

一个偏中文写作的 Hexo 博客模板，已经包含：

- `maupassant` 主题定制
- `Almanac` 年历式页面
- `Journal` 专用页面类型
- 影评 / 书评 / 探店卡片页
- 自定义 scaffold
- 自动维护 Markdown `updated` 字段的提交钩子

这个模板默认不要求 Cloudflare、R2、外部图床或额外鉴权服务。下载后完成基础配置，就可以直接本地预览并部署到 GitHub Pages。

## 1. 获取模板

如果你不会 Git，最简单的方式是直接下载 ZIP：

1. 打开本项目页面。
2. 点击绿色 `Code` 按钮。
3. 选择 `Download ZIP`。
4. 解压到你想保存项目的位置。

如果你已经安装了 Git，可以直接克隆：

```bash
git clone <你的仓库地址>
cd <你的项目目录>
```

## 2. 环境要求

建议先准备好下面这些环境：

- Node.js 18 或更高版本
- npm
- Python 3

可选但推荐：

- 已配置好的 Git / GitHub 账号

安装完项目依赖后，可以直接在仓库根目录使用：

- `hexo s`
- `hexo g`
- `hexo d`

也就是说，默认工作流不要求你额外全局安装 `hexo-cli`。

## 3. 快速开始

### 3.1 安装依赖

在项目根目录执行：

```bash
npm install
```

### 3.2 初始化 Almanac 页面

这个模板带有 `source/almanac/`，第一次使用前建议执行初始化：

```bash
npm run almanac:init
```

如果你的系统没有识别 `python3`，也可以手动运行：

```bash
python3 almanac.py --init
```

### 3.3 本地启动

直接运行：

```bash
hexo s
```

启动成功后，浏览器打开 [http://localhost:4000](http://localhost:4000)。

如果你更喜欢统一走 `npm scripts`，等价命令是：

```bash
npm run server
```

## 4. 你需要先改掉的配置

模板中的默认值只是占位符。第一次使用前，至少检查下面几个地方：

### 4.1 站点信息

编辑根目录 `./_config.yml`：

- `title`
- `subtitle`
- `description`
- `author`
- `language`
- `url`
- `timezone`

### 4.2 主题信息

编辑 `./themes/maupassant/_config.yml`：

- `menu`
- `widgets`
- `info.avatar`
- `info.outlinkitem`
- `post_copyright.author`
- `post_copyright.contact`
- 评论系统配置

### 4.3 部署信息

如果你要部署到 GitHub Pages，需要把 `_config.yml` 里的 `deploy` 段改成你自己的仓库地址，例如：

```yaml
deploy:
  type: git
  repo: git@github.com:your-github-id/your-github-id.github.io.git
  branch: main
```

## 5. 本地预览与构建

### 5.1 本地预览

```bash
hexo s
```

这是最常用的日常命令。

### 5.2 只生成静态文件

```bash
hexo g
```

生成结果会输出到 `public/`。

等价命令：

```bash
npm run build
```

### 5.3 清理缓存

```bash
hexo clean
```

如果你修改了主题、布局或生成逻辑后出现奇怪问题，可以先执行这个命令，再重新构建。

## 6. 部署到 GitHub Pages

### 6.1 创建仓库

推荐新建一个公开仓库：

- 用户主页站点：`<你的 GitHub 用户名>.github.io`
- 项目站点：任意仓库名都可以，但需要同时修改 `url` 和 `root`

### 6.2 配置 deploy

在 `_config.yml` 中填写：

```yaml
deploy:
  type: git
  repo: git@github.com:your-github-id/your-github-id.github.io.git
  branch: main
```

### 6.3 一键发布

这个模板已经加了一个更适合日常使用的命令：

```bash
npm run release
```

它会顺序执行：

1. `hexo clean`
2. `hexo generate`
3. `hexo deploy`

如果你只想在已经构建完成的前提下单独部署，也可以执行：

```bash
hexo d
```

### 6.4 部署到 Cloudflare Pages

如果你想把这个仓库部署到 Cloudflare Pages，推荐直接使用 Pages 的 Git 集成功能。对这个模板来说，这是最省事的方案。

#### 第一步：把仓库推到 GitHub 或 GitLab

先把博客仓库推到远端。Pages 会直接从你的 Git 仓库拉代码并自动构建。

#### 第二步：在 Cloudflare 创建 Pages 项目

在 Cloudflare Dashboard 中依次进入：

1. `Workers & Pages`
2. `Create application`
3. `Pages`
4. `Connect to Git`

然后选择你的 GitHub 或 GitLab 仓库。

#### 第三步：填写构建配置

这个模板建议使用下面这组配置：

- Production branch: `main`
- Build command: `npm run build`
- Build output directory: `public`
- Root directory: 留空

这个仓库的 `npm run build` 实际执行的是 `hexo generate`，因此 Pages 只需要构建并上传 `public/` 即可。

#### 第四步：点击保存并部署

点击 `Save and Deploy` 后，Cloudflare Pages 会自动：

1. 安装依赖
2. 执行构建命令
3. 发布到你的 `*.pages.dev` 子域名

第一次部署成功后，后续只要你继续向生产分支推送代码，Pages 就会自动重新构建和发布。

#### 第五步：以后如何更新站点

如果你已经接入了 Pages 的 Git 集成，以后通常不需要再执行：

```bash
hexo d
```

对 Cloudflare Pages 来说，更常见的发布动作是：

```bash
git push origin main
```

也就是说：

- GitHub Pages 风格：本地 `hexo d`
- Cloudflare Pages 风格：推代码后云端自动构建

#### 可选：固定 Node.js 版本

Cloudflare Pages 当前默认提供 Node.js 22 构建环境。如果你想显式固定版本，可以在 Pages 项目里设置环境变量：

- `NODE_VERSION=22`

如果你希望构建时间与仓库配置保持一致，也可以额外设置：

- `TZ=Asia/Shanghai`

这一条是针对当前模板的时区配置做的仓库级建议，不是 Pages 的强制要求。

#### 可选：绑定自定义域名

部署完成后，你可以在 Pages 项目的 `Custom domains` 中绑定自己的域名或子域名。

#### 这个模板在 Pages 上不需要额外配置什么

按当前模板的默认用法，部署静态站点到 Pages 时：

- 不需要 `hexo-deployer-git`
- 不需要额外的 R2 配置
- 不需要额外的图床校验脚本
- 不需要额外绑定 Pages Functions 环境变量

如果你后续自己启用了 `functions/` 目录下的额外能力，或者重新接入对象存储、图片代理，再单独补对应配置即可。

## 7. 如何少输命令

这是很多人真正会用到的部分。

### 7.1 最简单的方式：直接用 npm scripts

如果你习惯直接使用 Hexo 命令，最常用的是：

```bash
hexo s
hexo g
hexo d
```

如果你更喜欢固定脚本名，模板也已经内置：

```bash
npm run server
npm run build
npm run release
```

### 7.2 用 shell 函数做到“不用先 cd 进目录”

如果你经常在终端里操作博客，可以把下面的函数放进 `~/.zshrc` 或 `~/.bashrc`：

```bash
hbs() {
  cd /path/to/your/blog || return
  hexo s
}

hbd() {
  cd /path/to/your/blog || return
  hexo clean && hexo g && hexo d
}
```

保存后执行：

```bash
source ~/.zshrc
```

以后你只需要输入：

```bash
hbs
hbd
```

### 7.3 用 SSH 别名简化 deploy 仓库地址

如果你不想在 `_config.yml` 里写很长的 GitHub SSH 地址，可以配置 `~/.ssh/config`：

```sshconfig
Host github-blog
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519
  IdentitiesOnly yes
```

然后把 `_config.yml` 的 deploy 仓库地址写成：

```yaml
deploy:
  type: git
  repo: github-blog:your-github-id/your-github-id.github.io.git
  branch: main
```

这样做的好处是：

- deploy 配置更短
- 如果你有多把 SSH key，更容易管理
- 换机器时只要迁移 SSH 配置即可

## 8. 写作方式

### 8.1 普通文章

```bash
npm run new:post -- "My New Post"
```

### 8.2 页面

```bash
npm run new:page -- about
```

### 8.3 影评 / 书评 / 探店

```bash
npm run new:movie -- "My Movie Review"
npm run new:book -- "My Book Review"
npm run new:tan -- "My Restaurant Review"
```

### 8.4 游记

```bash
npm run new:travel -- "My Travel Note"
```

## 9. 影评 / 书评 / 探店卡片系统

这个模板内置了类似豆瓣列表页的卡片展示逻辑。

只要文章标签包含下面任意一种，对应标签页就会自动切换成卡片视图：

- `影评`
- `书评`
- `探店`

### 9.1 常用 front-matter 字段

- `rating`
  0 到 10 分，会自动换算成星级展示
- `show_tags`
  用于卡片页的子分类筛选
- `excerpt`
  用于卡片摘要
- `city`
  仅探店页使用，可按城市筛选
- `pub_year`
  可选，用于补充作品出版年份

### 9.2 卡片封面规则

模板会按下面顺序寻找卡片封面：

1. 文章正文中的最后一张图片
2. 内置的通用占位图

也就是说，即使你一篇影评 / 书评 / 探店文章里暂时没有插图，页面也不会空掉。

## 10. 图片如何处理

这个模板默认开启了：

```yaml
post_asset_folder: true
```

也就是说，你可以直接使用 Hexo 的文章资源目录方式管理图片。

例如新建一篇文章后：

```text
source/_posts/My-New-Post.md
source/_posts/My-New-Post/image-1.jpg
```

只要 Markdown 引用正确，Hexo 本地预览和常规部署就可以直接工作。模板默认不要求图床，也不会在提交时强制上传图片。

## 11. Almanac 与 Journal

### 11.1 Almanac

`source/almanac/` 是年历式短记录页面。模板已经带有对应布局：

- `layout: almanac-day`
- `source/almanac/index.html`
- `themes/maupassant/layout/almanac-day.pug`

首次使用请执行：

```bash
npm run almanac:init
```

### 11.2 Journal

`source/journal/` 是比普通文章更专题化的记录页面，模板中已经准备了对应布局：

- `themes/maupassant/layout/journal.pug`
- `themes/maupassant/layout/journal-index.pug`

如果你不需要这个能力，可以暂时不使用；它不会影响普通文章写作。

## 12. 仓库结构

常用目录如下：

- `source/`
  站点内容本体
- `source/_posts/`
  普通文章
- `source/almanac/`
  Almanac 页面
- `themes/maupassant/`
  主题布局、样式和前端脚本
- `scaffolds/`
  文章模板
- `scripts/`
  Hexo 构建辅助脚本
- `.husky/`
  Git hooks

## 13. 自带脚本与自动化

### 13.1 提交钩子

模板默认启用了 Husky。当前提交钩子只做一件事：

- 自动更新 Markdown 的 `updated` 字段

这意味着你平时正常提交文章时，不需要手动维护更新时间。

### 13.2 其他辅助脚本

仓库里还有一些 Python / Node / Shell 脚本，用于：

- 初始化 Almanac
- 处理标签页面
- 批量替换文本
- 图片相关维护

这些脚本不是博客正常运行的必需条件。你可以先不碰它们，等确实有需要时再看。

## 14. 发布前的个人信息检查

这是公开模板最容易忽略的地方。第一次发布到自己的仓库前，建议逐项检查：

- `_config.yml` 里的 `title`、`author`、`url`
- `themes/maupassant/_config.yml` 里的 `avatar`、社交链接、邮箱、版权信息
- deploy 仓库地址
- 评论系统域名和密钥
- 示例文章内容是否需要替换

如果你准备把这个模板继续公开发布给别人使用，尤其要确认不要把下面这些信息写死在模板里：

- 真实姓名
- 私人邮箱
- 私有域名
- 私有 API 地址
- 私人图片 CDN 地址
- 私有 Git 仓库地址

## 15. 常见问题

### 15.1 `hexo: command not found`

先确认你已经执行过：

```bash
npm install
```

然后重新打开一个终端窗口，再执行：

```bash
hexo s
```

如果你仍然不想直接用 `hexo` 命令，也可以退回到：

```bash
npm run server
```

### 15.2 改了主题但页面没变化

先执行：

```bash
hexo clean
hexo g
```

### 15.3 deploy 报 Git 权限错误

优先检查：

- SSH key 是否已经加到 GitHub
- `_config.yml` 里的 `repo` 是否正确
- SSH 别名是否配置正确

### 15.4 图片很多，会不会把仓库变大

会。这个模板默认选择的是“普通 Hexo 可直接使用”的方案，也就是不强制依赖图床。优点是简单，缺点是图片很多时仓库会变大。

如果你以后确实需要图床、对象存储或更复杂的资源代理，建议在你自己的博客仓库里按需添加，而不是把它作为公共模板的默认前提。
