# 贡献指南

感谢您考虑为Inpayment SDK贡献代码！以下是一些贡献的指导方针。

## 开发流程

1. Fork此仓库
2. 克隆您的Fork版本到本地
3. 创建一个新的分支：`git checkout -b feature/your-feature-name`
4. 进行您的更改
5. 确保代码通过测试：`pnpm test`
6. 确保代码通过代码检查：`pnpm lint`
7. 提交您的更改：`git commit -am 'feat: add some feature'`
8. 推送您的分支：`git push origin feature/your-feature-name`
9. 创建一个Pull Request

## 提交规范

我们使用[约定式提交](https://www.conventionalcommits.org/zh-hans)规范，提交信息格式如下：

```
<类型>[可选的作用域]: <描述>

[可选的正文]

[可选的脚注]
```

常用的提交类型包括：

- `feat`：新功能
- `fix`：修复bug
- `docs`：文档更改
- `style`：代码风格变更（不影响代码功能）
- `refactor`：代码重构（既不是新功能，也不是修复bug）
- `perf`：性能优化
- `test`：添加或修改测试
- `chore`：构建过程或辅助工具的变动

## 开发设置

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# 测试
pnpm test

# 代码检查
pnpm lint
```

## 发布流程

只有维护者才能发布新版本。发布流程如下：

1. 确保所有代码已合并到主分支
2. 更新CHANGELOG.md
3. 运行 `npm version [patch|minor|major]` 更新版本号
4. 推送到GitHub: `git push && git push --tags`
5. 运行 `npm publish` 发布到npm

## 谢谢您的贡献！
