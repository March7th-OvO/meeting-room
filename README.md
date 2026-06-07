# Meeting Room — 会议室预订系统

基于 Web 的会议室预订管理系统，采用前后端分离架构，支持用户预订、管理员审批与数据统计。

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 19 + TypeScript + Vite + Tailwind CSS v4 |
| 图表 | ECharts + echarts-for-react |
| 动画 | Motion (former Framer Motion) |
| 图标 | Lucide React |
| 后端 | FastAPI (Python 3.13) |
| ORM | SQLAlchemy 2.0 + Alembic |
| 鉴权 | JWT (python-jose) |
| 数据库 | SQLite（默认）/ MySQL（可切换） |

## 功能概览

### 用户端
- 账号密码登录 / JWT 鉴权
- 会议室搜索与浏览
- 预订申请（日期 + 时段选择）
- 我的预订列表（含审批状态与驳回原因）
- 取消预订

### 管理员端
- 会议室管理（新增 / 编辑 / 删除）
- 预订审批（批准 / 驳回 + 备注）
- 数据统计看板（使用次数柱状图、状态分布饼图、实时使用比例）

## 项目结构

```text
meeting-room/
├── backend/
│   ├── app/
│   │   ├── api/          # 路由与接口
│   │   ├── core/         # 配置、安全、依赖注入
│   │   ├── db/           # 数据库会话与种子数据
│   │   ├── models/       # SQLAlchemy 模型
│   │   ├── repositories/ # 数据访问层
│   │   ├── schemas/      # Pydantic 请求/响应模型
│   │   ├── services/     # 业务逻辑层
│   │   └── main.py       # 应用入口
│   ├── alembic/          # 数据库迁移
│   ├── tests/            # 后端测试
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/   # 公共组件
│   │   ├── pages/        # 页面组件
│   │   │   └── admin/    # 管理端页面
│   │   ├── lib/          # 工具函数与 API 客户端
│   │   └── types/        # TypeScript 类型定义
│   └── package.json
└── docs/                 # 设计文档与计划
```

## 快速开始

### 演示账号

系统首次启动后自动写入种子数据：

| 账号 | 密码 | 角色 |
|------|------|------|
| `admin` | `123456` | 管理员 |
| `user1` | `123456` | 普通用户 |
| `user2` | `123456` | 普通用户 |

### 后端

```bash
cd backend
py -3.13 -m pip install -r requirements.txt
py -3.13 -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

- API 地址：http://127.0.0.1:8000
- Swagger 文档：http://127.0.0.1:8000/docs

环境变量配置参考 `backend/.env.example`。

### 前端

```bash
cd frontend
npm install
npm run dev
```

- 页面地址：http://127.0.0.1:3000

环境变量配置参考 `frontend/.env.example`。

## 数据库

默认使用 SQLite，开箱即用：

```env
DATABASE_URL=sqlite:///./meeting_room.db
```

切换到 MySQL：

1. 安装驱动：`pip install pymysql`（已包含在 requirements.txt 中）
2. 修改 `DATABASE_URL`：
   ```env
   DATABASE_URL=mysql+pymysql://user:password@host:3306/meeting_room
   ```
3. 运行 Alembic 迁移并回归测试核心流程

## 测试与构建

```bash
# 后端测试
cd backend
py -3.13 -m pytest tests/ -v

# 前端类型检查
cd frontend
npm run lint

# 前端生产构建
cd frontend
npm run build
```

## 开源许可

本项目基于 [GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0) 开源。

```
Meeting Room — 会议室预订系统
Copyright (C) 2026  March7th-OvO

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
```
