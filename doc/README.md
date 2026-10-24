# Lab1 Phase 1：SVG 编辑器实现报告

## 架构方案（初稿）

采用 TypeScript 面向对象实现，类与文件同名。领域对象封装属性及树结构，不把模型作为可随意修改的公共数据袋。

| 模块 | 职责 |
| --- | --- |
| `src/domain/` | 图形继承层次、Composite 容器、文档与几何约束 |
| `src/application/` | 编辑会话、Command、历史记录、输入参数与 IO 端口 |
| `src/application/commands/` | 每条命令的具体类 |
| `src/infrastructure/` | SVG XML 编解码和文件系统适配器 |
| `src/cli/` | 引号词法分析、命令分发、REPL 与统一错误输出 |
| `src/main.ts` | 组合根，装配适配器与 CLI |
| `test/`、`fixtures/`、`examples/` | 自动化验证、读入样本与可回放脚本 |

依赖方向：CLI → application → domain；infrastructure → application 的端口 + domain；domain 不依赖其他层。main 可以依赖所有层完成装配。

使用 Command 模式封装动作，Composite 统一叶子和容器；编辑在文档副本上执行，成功后一次性提交，以快照实现 Memento，保证失败原子性。文档 IO 成功后清空历史并设置屏障，失败不改变文档、路径或历史。

仅两处按名称分派：CLI 命令注册表与 domain 图形工厂。按作业要求将其标注为后续插件阶段的待重构点，当前不实现插件加载、box 类型或 GUI。

## 过程记录

1. 阅读 `phase_cli_1.md`：确认 Phase 1 的六类图形、顶层容器禁止解散、文档命令的历史屏障与分步 Git 提交要求。
2. 选择使用副本文档执行编辑：group 跨父节点移动、容器缩放和失败恢复均需原子性；快照以额外内存换取课程规模下的正确性与可检查性。
3. 建立工程和初始架构文档。后续记录按实际实现和测试结果补充，不虚构用户讨论。

## 一致性自查

实现完成后检查目录、模块依赖与两处分派边界。

## 质量保证手段

计划执行严格 TypeScript 类型检查、领域与命令测试、文件读写和 CLI 脚本回放，最终记录实际结果。
