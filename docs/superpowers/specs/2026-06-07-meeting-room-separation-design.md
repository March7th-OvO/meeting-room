# 会议室预订系统前后端分离设计方案

## 背景与目标

当前项目是一个基于 `React + Vite` 的单体前端原型，核心业务数据通过前端内存状态和 mock 数据维护。系统已经具备会议室查询、预订申请、我的预订、管理员审批、会议室管理、统计展示等基础页面，但尚未具备真实后端、持久化存储、账号密码认证、权限控制与并发校验能力。

本次设计目标是将项目演进为前后端分离架构：

- 前端：`React + Vite`
- 后端：`FastAPI`
- 数据库：第一阶段 `SQLite`
- 后续兼容：可平滑替换为 `MySQL`

第一阶段功能边界如下：

- 使用账号密码登录
- 使用 JWT 做登录态管理
- 权限仅区分 `user` 和 `admin`
- 普通用户提交预订后进入待审批
- 管理员创建预订时自动审批通过
- 不支持周期性预订
- 预留未来扩展重复预订的模型空间

## 现状分析

当前前端项目具备较清晰的业务分区，但业务规则全部停留在前端：

- 登录通过匹配 mock 用户完成，无密码体系
- 会议室与预订数据来自本地 mock 数据文件
- 预订新增、审批流转、统计聚合均在前端状态中完成
- 会议室新增与编辑尚未实现完整业务逻辑

这意味着现阶段几乎不存在历史数据库和接口包袱，适合直接建立清晰的前后端边界，并逐步将前端页面从 mock 数据切换到真实 API。

## 方案概述

采用同仓库双应用结构，前端和后端分目录管理：

```text
meeting-room/
  frontend/
  backend/
    app/
      api/
      core/
      db/
      models/
      repositories/
      schemas/
      services/
    tests/
  docs/
```

这样做的原因：

- 迁移成本低，适合从现有前端逐步演进
- 前后端边界清晰，便于独立开发和部署
- 同一仓库便于保持接口文档、前端实现与后端模型同步

不采用单独前后端仓库的原因是当前系统规模不大，过早拆仓会增加协作和部署复杂度。

## 技术选型

| 类别 | 选择 | 理由 |
|------|------|------|
| 前端 | React + Vite | 现有项目已采用，保留成本最低 |
| 后端框架 | FastAPI | Python 生态成熟，类型提示完整，接口文档自动生成，适合业务型系统 |
| ORM | SQLAlchemy 2.x | 支持 SQLite 与 MySQL，利于数据库切换 |
| 数据迁移 | Alembic | 统一管理数据库版本与切换过程 |
| 数据校验 | Pydantic | 与 FastAPI 深度集成，适合请求响应契约定义 |
| 认证 | JWT | 适合前后端分离架构 |
| 密码安全 | Passlib / bcrypt | 提供密码哈希能力 |
| 第一阶段数据库 | SQLite | 启动成本低，便于本地开发 |
| 后续数据库 | MySQL | 满足后续扩展需求 |

## 架构设计

### 总体分层

系统按以下职责分层：

- 前端展示层：页面渲染、表单提交、鉴权状态管理、调用后端 API
- API 路由层：接收 HTTP 请求、参数校验、鉴权、返回响应
- 业务服务层：封装预约冲突校验、审批状态流转、统计聚合等规则
- 数据访问层：屏蔽 ORM 查询细节，统一数据读写入口
- 数据模型层：定义数据库表结构与关系

### 后端模块划分

| 模块 | 职责 | 依赖 |
|------|------|------|
| `app/api` | 路由注册、接口分组、依赖注入 | `schemas`, `services`, `core` |
| `app/core` | 配置、JWT、密码哈希、异常处理 | - |
| `app/db` | 数据库连接、会话管理、Base、迁移配置 | `core` |
| `app/models` | SQLAlchemy ORM 模型 | `db` |
| `app/repositories` | 数据库读写封装 | `models`, `db` |
| `app/schemas` | 请求体、响应体定义 | - |
| `app/services` | 业务规则、流程编排 | `repositories`, `schemas`, `models` |
| `backend/tests` | 单元测试、接口测试 | 全部业务模块 |

### 前端模块调整方向

前端保持现有页面结构，但做以下调整：

- 将 `mockUsers`、`mockRooms`、`mockBookings` 替换为 API 调用
- 新增登录态管理模块，存储 JWT 与当前用户信息
- 将页面内状态更新改为“调用接口后刷新列表或更新缓存”
- 将统计页改为消费后端聚合数据接口

前端仍然只负责界面和交互，不承载业务规则判定。

## 关键设计决策

| 决策点 | 选择 | 理由 |
|--------|------|------|
| 仓库结构 | 同仓库双应用 | 适合当前规模，方便渐进式迁移 |
| 数据访问方式 | ORM + Repository | 避免路由层直接操作数据库，提升可维护性 |
| 数据库兼容策略 | `DATABASE_URL` + SQLAlchemy + Alembic | 为 SQLite 到 MySQL 切换提供统一抽象 |
| 角色模型 | `user/admin` 两级 | 满足当前需求，避免过早引入复杂 RBAC |
| 审批流 | 普通用户待审批，管理员自动通过 | 符合当前业务与管理场景 |
| 周期预订 | 第一阶段不支持，仅预留扩展空间 | 控制复杂度，避免过早设计 |
| 状态字段 | 字符串存储，不使用数据库原生枚举 | 降低 SQLite 与 MySQL 兼容成本 |
| 设备信息 | 独立关联表 | 避免依赖 JSON/数组字段的方言差异 |

## 数据模型设计

### 1. users

表名：`users`

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | `Integer` | PK, Auto Increment | 用户主键 |
| `username` | `String(50)` | Unique, Not Null | 登录账号 |
| `password_hash` | `String(255)` | Not Null | 密码哈希 |
| `role` | `String(20)` | Not Null | `user` / `admin` |
| `is_active` | `Boolean` | Not Null, Default True | 是否启用 |
| `created_at` | `DateTime` | Not Null | 创建时间 |
| `updated_at` | `DateTime` | Not Null | 更新时间 |

索引：

- 唯一索引：`username`

### 2. rooms

表名：`rooms`

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | `Integer` | PK, Auto Increment | 会议室主键 |
| `name` | `String(100)` | Unique, Not Null | 会议室名称 |
| `capacity` | `Integer` | Not Null | 容纳人数 |
| `status` | `String(20)` | Not Null | `available` / `maintenance` |
| `location` | `String(100)` | Null | 位置，可选 |
| `description` | `Text` | Null | 描述，可选 |
| `created_at` | `DateTime` | Not Null | 创建时间 |
| `updated_at` | `DateTime` | Not Null | 更新时间 |

索引：

- 唯一索引：`name`
- 普通索引：`status`

### 3. room_equipments

表名：`room_equipments`

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | `Integer` | PK, Auto Increment | 主键 |
| `room_id` | `Integer` | FK -> `rooms.id`, Not Null | 所属会议室 |
| `equipment_name` | `String(100)` | Not Null | 设备名称 |

索引：

- 普通索引：`room_id`

### 4. bookings

表名：`bookings`

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | `Integer` | PK, Auto Increment | 预订主键 |
| `room_id` | `Integer` | FK -> `rooms.id`, Not Null | 会议室 |
| `user_id` | `Integer` | FK -> `users.id`, Not Null | 申请人 |
| `booking_date` | `Date` | Not Null | 预约日期 |
| `start_time` | `Time` | Not Null | 开始时间 |
| `end_time` | `Time` | Not Null | 结束时间 |
| `purpose` | `String(255)` | Not Null | 会议用途 |
| `status` | `String(20)` | Not Null | `pending` / `approved` / `rejected` / `cancelled` |
| `approval_comment` | `String(255)` | Null | 审批备注 |
| `approved_by` | `Integer` | FK -> `users.id`, Null | 审批人 |
| `approved_at` | `DateTime` | Null | 审批时间 |
| `created_at` | `DateTime` | Not Null | 创建时间 |
| `updated_at` | `DateTime` | Not Null | 更新时间 |

索引：

- 组合索引：`(room_id, booking_date, start_time, end_time)`
- 组合索引：`(user_id, status)`
- 普通索引：`status`

### 5. 周期预订扩展预留

第一阶段不创建周期预订表，不开放重复预订接口。

但在业务设计上预留未来扩展方向：

- 新增 `booking_recurrence_rules` 表记录重复规则
- 将单次实例与规则主表关联
- 保持当前 `bookings` 仍可表示单次预订

这样可以避免第一阶段引入不必要复杂度，同时不给后续扩展制造迁移障碍。

## 业务规则设计

### 1. 登录与权限

- 用户使用 `username + password` 登录
- 登录成功后返回 JWT
- 前端持有访问令牌，并通过 `/auth/me` 获取当前用户信息
- 普通用户仅能访问自己的预订数据
- 管理员可管理会议室、审批预订、查看统计

### 2. 会议室状态规则

- `available` 表示会议室允许被预约
- `maintenance` 表示会议室维护中，不允许预约

注意：会议室的“可预约状态”与某个时段是否已被占用不是一个概念。

- `rooms.status` 表示静态状态
- 某个时间段是否能预约由预订数据计算

### 3. 预订创建规则

- 仅允许对 `available` 状态的会议室发起预约
- 开始时间必须早于结束时间
- 不能预约过去时间
- 预订用途必填
- 普通用户创建预订后状态为 `pending`
- 管理员创建预订后状态为 `approved`

### 4. 时间冲突规则

后端必须在事务内执行冲突校验，前端校验仅作用户体验优化。

冲突定义：

- 同一会议室
- 同一日期
- 时间段有重叠
- 且现有记录状态属于会占用资源的状态

第一阶段对以下状态执行冲突阻塞：

- `approved`
- `pending`

不阻塞的状态：

- `rejected`
- `cancelled`

之所以对 `pending` 也阻塞，是为了避免同一时段堆积大量待审批单，降低审批复杂度与用户预期落差。

### 5. 审批流规则

- 普通用户提交后进入 `pending`
- 管理员可将 `pending` 更新为 `approved` 或 `rejected`
- 仅 `pending` 状态允许审批流转
- 管理员创建的预订直接写入 `approved`
- 已取消或已拒绝的记录不可再次审批

### 6. 取消规则

- 普通用户仅可取消自己的预订
- 管理员可取消任意预订
- `pending` 与 `approved` 状态允许取消
- `rejected` 与 `cancelled` 状态不可重复取消

## API 设计

统一前缀：`/api/v1`

统一响应建议：

```json
{
  "code": 0,
  "message": "ok",
  "data": {}
}
```

错误响应建议：

```json
{
  "code": 4001,
  "message": "booking time conflicts",
  "data": null
}
```

### 鉴权接口

#### 1. 登录

- 接口名称：登录
- 请求方式：`POST`
- 请求路径：`/api/v1/auth/login`

请求体：

```json
{
  "username": "user1",
  "password": "plaintext-password"
}
```

响应体：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "access_token": "jwt-token",
    "token_type": "bearer",
    "user": {
      "id": 1,
      "username": "user1",
      "role": "user"
    }
  }
}
```

#### 2. 当前用户信息

- 接口名称：获取当前用户
- 请求方式：`GET`
- 请求路径：`/api/v1/auth/me`

### 会议室接口

#### 1. 查询会议室列表

- 请求方式：`GET`
- 请求路径：`/api/v1/rooms`

查询参数：

- `keyword`：会议室名称关键字，可选
- `min_capacity`：最小容量，可选
- `status`：会议室状态，可选

#### 2. 获取会议室详情

- 请求方式：`GET`
- 请求路径：`/api/v1/rooms/{room_id}`

#### 3. 创建会议室

- 请求方式：`POST`
- 请求路径：`/api/v1/admin/rooms`
- 权限：`admin`

#### 4. 更新会议室

- 请求方式：`PATCH`
- 请求路径：`/api/v1/admin/rooms/{room_id}`
- 权限：`admin`

#### 5. 删除会议室

- 请求方式：`DELETE`
- 请求路径：`/api/v1/admin/rooms/{room_id}`
- 权限：`admin`

删除策略建议：

- 若存在未完成相关预订，优先做软限制，不直接硬删
- 第一阶段可返回业务错误，提示先处理关联预订

### 预订接口

#### 1. 创建预订

- 请求方式：`POST`
- 请求路径：`/api/v1/bookings`

请求体：

```json
{
  "room_id": 1,
  "booking_date": "2026-06-08",
  "start_time": "14:00:00",
  "end_time": "15:00:00",
  "purpose": "项目评审"
}
```

业务行为：

- 普通用户创建为 `pending`
- 管理员创建为 `approved`
- 校验时间顺序、冲突、会议室状态

#### 2. 查询我的预订

- 请求方式：`GET`
- 请求路径：`/api/v1/bookings/me`

建议支持参数：

- `status`
- `booking_date_from`
- `booking_date_to`

#### 3. 取消预订

- 请求方式：`PATCH`
- 请求路径：`/api/v1/bookings/{booking_id}/cancel`

### 管理员预订接口

#### 1. 查询预订列表

- 请求方式：`GET`
- 请求路径：`/api/v1/admin/bookings`
- 权限：`admin`

建议支持筛选：

- `status`
- `room_id`
- `user_id`
- `booking_date_from`
- `booking_date_to`

#### 2. 审批预订状态

- 请求方式：`PATCH`
- 请求路径：`/api/v1/admin/bookings/{booking_id}/status`
- 权限：`admin`

请求体：

```json
{
  "status": "approved",
  "approval_comment": "通过"
}
```

允许值：

- `approved`
- `rejected`

### 统计接口

#### 1. 统计概览

- 请求方式：`GET`
- 请求路径：`/api/v1/admin/statistics/overview`
- 权限：`admin`

返回示例：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "room_count": 4,
    "approved_booking_count": 10,
    "pending_booking_count": 2
  }
}
```

#### 2. 会议室使用统计

- 请求方式：`GET`
- 请求路径：`/api/v1/admin/statistics/room-usage`
- 权限：`admin`

#### 3. 预订状态统计

- 请求方式：`GET`
- 请求路径：`/api/v1/admin/statistics/booking-status`
- 权限：`admin`

## SQLite 到 MySQL 的兼容设计

这是本方案的重点约束，所有实现都需要遵守以下原则：

### 1. 统一连接入口

所有数据库连接统一通过 `DATABASE_URL` 配置：

- SQLite：`sqlite:///./meeting_room.db`
- MySQL：`mysql+pymysql://user:password@host:3306/meeting_room`

### 2. 避免数据库方言耦合

- 不依赖 SQLite 专属 SQL
- 不依赖 MySQL 专属函数
- 不使用数据库原生 `ENUM`
- 不将设备字段设计为数据库 JSON 数组必需结构

### 3. 迁移工具统一

- 使用 Alembic 生成与管理迁移脚本
- SQLite 与 MySQL 共用同一套 ORM 模型定义

### 4. 时间冲突尽量在应用层保证一致行为

涉及时间段交叉的规则，由服务层统一实现核心判定逻辑，避免数据库间行为差异导致结果不一致。

### 5. 索引提前设计

为预订查询和冲突判断预置索引，避免 MySQL 切换后再做结构补救。

## 错误处理设计

建议统一定义业务错误码，例如：

- `1001`：参数错误
- `1002`：认证失败
- `1003`：权限不足
- `2001`：会议室不存在
- `2002`：会议室维护中不可预约
- `2003`：预订时间冲突
- `2004`：预订状态不允许当前操作
- `2005`：用户不存在或已禁用

服务层负责抛出可识别业务异常，API 层负责转换为统一响应格式。

## 测试设计

第一阶段测试重点：

- 认证登录测试
- 权限校验测试
- 会议室 CRUD 测试
- 预订创建测试
- 时间冲突测试
- 审批流测试
- 取消预订测试
- 统计接口测试

测试分层建议：

- Repository 层：少量数据库读写测试
- Service 层：重点覆盖业务规则
- API 层：覆盖接口行为、鉴权与响应格式

## 分阶段实施计划建议

### 阶段 1：后端基础骨架

- 初始化 `backend` 项目结构
- 建立 FastAPI 应用入口
- 建立配置、数据库连接、Base、会话工厂
- 建立 `users`、`rooms`、`room_equipments`、`bookings` 模型
- 配置 Alembic

### 阶段 2：认证与权限

- 实现密码哈希
- 实现 JWT 签发与解析
- 实现登录接口与当前用户接口
- 建立管理员鉴权依赖

### 阶段 3：会议室与预订核心业务

- 实现会议室查询接口
- 实现会议室管理接口
- 实现预订创建与我的预订查询
- 实现时间冲突判定
- 实现取消预订

### 阶段 4：审批与统计

- 实现管理员预订列表
- 实现审批接口
- 实现统计概览与图表数据接口

### 阶段 5：前端接入

- 将现有前端迁移至 `frontend/`
- 增加 API 客户端封装
- 替换 mock 数据源
- 接入登录态与鉴权
- 对接管理员页面与统计页

### 阶段 6：数据库切换准备

- 编写环境配置说明
- 验证 MySQL 驱动与迁移兼容性
- 补充切换回归测试清单

## 风险与注意事项

### 1. 当前前端中的时间与状态逻辑较为简化

改为真实后端后，状态流转与冲突判断将变得严格，前端不能再直接假设提交一定成功。

### 2. 删除会议室存在关联数据问题

若会议室已有历史预订，删除策略需要谨慎。第一阶段建议限制删除，而不是级联硬删历史数据。

### 3. SQLite 并发能力有限

第一阶段作为开发和轻量运行环境可接受，但若后续访问量上升，应尽快切换 MySQL。

### 4. 周期预订暂未开放

接口与页面要避免出现“看似支持但实际未实现”的入口，以免造成误导。

## 结论

当前项目非常适合演进为 `React + FastAPI + SQLite` 的前后端分离架构。由于现有实现仍停留在前端 mock 阶段，迁移过程可以围绕“先立接口与模型，再逐步替换页面数据源”展开，整体成本可控。

通过 `SQLAlchemy + Alembic + DATABASE_URL` 的组合，以及避免数据库方言耦合的建模方式，本方案能够在第一阶段使用 SQLite，同时为后续切换到 MySQL 保持较好的兼容性与可扩展性。

下一步应基于本设计文档输出详细实施计划，再进入代码实现阶段。
