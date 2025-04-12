# Changelog

This document records all significant changes to the Inpayment SDK.

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
