# Changelog

所有重要的版本更新都会在这个文件中记录。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
并且本项目遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/) 语义化版本规范。

## [1.1.5] - 2024-04-20

### Added / 新增

- 添加`getUnlockTime`方法，用于获取项目的解锁时间
- 添加`getReleaseAmount`方法，用于获取可释放的代币数量
- 优化示例项目，添加锁仓信息展示功能

### Changed / 变更

- 优化锁仓相关功能的用户体验
- 改进示例项目的UI展示

## [1.1.4] - 2024-04-19

### Added / 新增

- 添加`getTokenUsdValue`方法，用于获取代币USD价格
- 更新示例代码，展示如何获取代币USD价格

## [1.1.3] - 2024-04-19

### Added / 新增

- 添加`getProjectProgress`方法，用于获取项目销售进度

## [1.1.2] - 2024-04-19

### Documentation / 文档

- 更新README.md，添加详细的类型字段说明
- 添加ethers v6依赖说明
- 优化代码示例，添加provider和signer的初始化说明
- 添加版本兼容性提醒

### Changed / 变更

- 优化文档结构和格式
- 完善类型字段的中文注释
- 改进代码示例的可读性

## [1.1.1] - 2024-04-19

### Changed / 变更

- 更新到 ethers v6 版本
- 修复地址验证相关的问题
- 更新测试用例以支持 ethers v6

### Added / 新增

- 添加对 ethers v6 的明确要求说明
- 改进错误处理和地址验证

## [1.1.0] - 2024-04-19

### Added / 新增

- 初始版本发布
- 实现基础功能：
  - 项目信息查询
  - ETH 购买代币
  - ERC20 代币购买
  - 代币释放
  - 锁仓计划管理

## [1.0.5] - 2024-04-18

### Fixed / 修复

- 修复了`releaseAllTokens`函数中`signer`参数未正确传递的问题

## [1.0.4] - 2024-04-13

### Added / 新增

- 新增`getVestingScheduleInfo`函数，用于获取锁仓计划详情
- 新增`getPeriodList`函数，用于计算锁仓释放时间点
- 新增`periodList`字段，显示锁仓释放的具体时间点

### Changed / 变更

- 优化了时间格式，使用`YYYY-MM-DD HH:mm:ss`格式
- 修改了`getPeriodList`函数的实现，返回每个2天周期的结束时间

### Fixed / 修复

- 修复了`VestingSchedule`接口缺少必需属性的问题
