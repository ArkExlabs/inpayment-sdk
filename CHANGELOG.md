# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2024-04-19

### Changed

- 更新到 ethers v6 版本
- 修复地址验证相关的问题
- 更新测试用例以支持 ethers v6

### Added

- 添加对 ethers v6 的明确要求说明
- 改进错误处理和地址验证

## [1.0.5] - 2024-04-18

### Added

- 初始版本发布
- 实现基础功能：
  - 项目信息查询
  - ETH 购买代币
  - ERC20 代币购买
  - 代币释放
  - 锁仓计划管理

## [1.0.4] - 2025-04-13

### Fixed

- 修复了`releaseAllTokens`函数中`signer`参数未正确传递的问题

## [1.0.3] - 2025-04-12

### Added

- 新增`getVestingScheduleInfo`函数，用于获取锁仓计划详情
- 新增`getPeriodList`函数，用于计算锁仓释放时间点
- 新增`periodList`字段，显示锁仓释放的具体时间点

### Changed

- 优化了时间格式，使用`YYYY-MM-DD HH:mm:ss`格式
- 修改了`getPeriodList`函数的实现，返回每个2天周期的结束时间

### Fixed

- 修复了`VestingSchedule`接口缺少必需属性的问题
