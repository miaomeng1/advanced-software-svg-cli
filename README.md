# SVG Editor CLI

高级软件开发 Lab1 Phase 1 作业。使用 **TypeScript + 面向对象**实现 SVG 命令行编辑器，包含 6 种图形、19 条命令、Command / Composite / Memento、原子编辑与撤销重做。

- 作业原文：[phase_cli_1.md](phase_cli_1.md)
- **提交报告：[doc/README.md](doc/README.md)**（架构方案、PlantUML 图、过程记录、一致性自查、质量保证）
- 架构图源文件：[doc/architecture.puml](doc/architecture.puml)
- 最终提交标签：`final`

## 快速开始

需要 Node.js **22 或更高版本**和 npm。

```sh
git clone git@github.com:miaomeng1/advanced-software-svg-cli.git
cd advanced-software-svg-cli
npm ci
npm run cli
```

```text
svg> init 800 600
svg> create g scene
svg> create rect card 40 40 180 80 #4a90d9 in scene
svg> create text title 60 85 "Hello SVG" in scene
svg> tree
svg> move scene 20 10
svg> undo
svg> save demo.svg
```

用浏览器打开 `demo.svg` 即可预览。输入 `help` 查看全部命令；按 **Ctrl-D** 退出。

## 脚本回放与构建

```sh
npm run cli < examples/demo.commands
npm run cli < examples/flowchart.commands
npm run check
npm run build
npm start
```

两份脚本分别生成项目根目录的 `demo.svg` 和 `flowchart.svg`。路径以运行命令时的工作目录为基准；含空格路径须用双引号。脚本模式不打印提示符，遇错继续执行后续行，最终退出码为 1；全部成功时为 0。

示例成品（与作业 6.1 一致）：

![流程图](examples/flowchart.svg)

## 命令速查

| 类别 | 命令 |
| --- | --- |
| 文档 | `init [w] [h]`、`read <file.svg>`、`save [file.svg]`、`canvas [w h]` |
| 创建 | `create <type> <id> [params…] [in <containerId>]` |
| 编辑 | `delete <id>`、`move <id> <dx> <dy>`、`scale <id> <factor>`、`set <id> <attr> <value>` |
| 容器 | `group <newGid> <id1> [id2…]`、`ungroup <gid>`、`addto <gid> <id>` |
| 层次 | `front <id>`、`back <id>` |
| 显示 | `tree [id]`、`show <id>`、`help` |
| 历史 | `undo`、`redo` |

| 类型 | 创建参数 |
| --- | --- |
| `rect` | `<id> <x> <y> <w> <h> [fill]` |
| `circle` | `<id> <cx> <cy> <r> [fill]` |
| `ellipse` | `<id> <cx> <cy> <rx> <ry> [fill]` |
| `line` | `<id> <x1> <y1> <x2> <y2> [stroke]` |
| `text` | `<id> <x> <y> "content"` |
| `g` | `<id>` |

所有创建形式均可追加 `in <containerId>`。`#` 仅在一行开头（可带前导空白）表示注释，因此颜色 `#ffffff` 不会被截断。双引号内支持 `\"` 和 `\\`。

`set` 只允许公共样式 `fill` / `stroke` / `stroke-width`、本类型的几何属性，以及 text 的 `text` 内容。id 大小写敏感且全局唯一，不能通过 `set` 修改。

## 关键语义

- `move` 使用增量；`scale` 同时缩放位置与尺寸，容器递归到全部后代。字体大小和描边宽度不属于本阶段的几何缩放属性。
- `group` 按原文档顺序收编。同父图形在原父级组合，跨父图形在画布根组合；新组放在首个被选同级图形的位置，跨父时通常追加根末尾。完整规则见报告。
- `ungroup` 按题目要求**禁止解散根级容器**，允许解散嵌套普通容器。
- `front` 放到同级末尾（最后绘制、视觉最前）；`back` 放到同级开头。
- 一条编辑命令是一个 undo 单元。失败不改变文档、历史或保存路径；undo 后新编辑清空 redo。
- 成功的 `init/read/save/canvas w h` 清空历史并设置屏障；`canvas` 查询及显示命令不影响历史。屏障后的 undo/redo 均输出题目约定的 `error: undo not allowed after io command`。

## SVG 支持范围

可往返读写六种内置图形、嵌套分组、文本、画布与 `viewBox`，保留 `font-size`、`text-anchor`、`data-*` 等被动属性。缺 id 时先预留全文件已有 id，再自动编号并警告。

此项目实现课程阶段的静态 SVG 子集：未知图形、`tspan`、CSS `style`、事件属性、外部引用和 DTD 等明确报错。`translate` 与正数等比 `scale` 可导入并按课程几何规则归一化；旋转、非等比缩放和根元素 transform 暂不支持。归一化不模拟字体/描边随变换缩放的完整浏览器语义。`box` 创建和插件加载属于后续阶段。

## 验证

`npm run check` 执行严格类型检查、33 项自动化测试和构建。GitHub Actions 在 Node.js 22 / 24 上执行相同检查及两个示例回放。

本项目不需要浏览器运行时或 GUI 依赖；XML 编解码使用 `@xmldom/xmldom`，测试使用 Node.js 内置测试框架。
