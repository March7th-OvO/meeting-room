# Meeting Room

会议室预订系统，已从单体 React 原型演进为前后端分离结构：

- `frontend/`: React + Vite + TypeScript
- `backend/`: FastAPI + SQLAlchemy + SQLite

## 当前能力

- 账号密码登录
- JWT 鉴权
- `user/admin` 两级角色
- 会议室查询
- 预订申请
- 我的预订
- 管理员会议室管理
- 管理员审批流
- 管理员统计看板
- SQLite 可通过 `DATABASE_URL` 平滑切换到 MySQL

## 目录结构

```text
meeting-room/
  backend/
    app/
    alembic/
    tests/
  frontend/
    src/
  docs/
```

## 演示账号

系统启动后会自动写入以下种子账号：

- `user1 / 123456`
- `user2 / 123456`
- `admin / 123456`

## 前端启动

```bash
cd frontend
npm install
npm run dev
```

默认地址：

- [http://127.0.0.1:3000](http://127.0.0.1:3000)

前端环境变量示例见：

- `frontend/.env.example`

## 后端启动

```bash
cd backend
py -3.13 -m pip install -r requirements.txt
py -3.13 -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

默认地址：

- API: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- Swagger: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

后端环境变量示例见：

- `backend/.env.example`

## 测试与构建

后端测试：

```bash
py -3.11 -m pytest backend/tests -v
```

前端类型检查：

```bash
cd frontend
npm run lint
```

前端生产构建：

```bash
cd frontend
npm run build
```

## 数据库与迁移

本地默认使用 SQLite：

```env
DATABASE_URL=sqlite:///./meeting_room.db
```

仓库已提供 Alembic 骨架和初始迁移：

- `backend/alembic.ini`
- `backend/alembic/env.py`
- `backend/alembic/versions/0001_initial.py`

如果后续切换到 MySQL，只需要：

1. 安装 MySQL 驱动，例如 `PyMySQL`
2. 将 `DATABASE_URL` 改为 MySQL 连接串
3. 执行迁移并回归测试核心预约流程

示例：

```env
DATABASE_URL=mysql+pymysql://user:password@host:3306/meeting_room
```

## 设计与计划

- 设计文档：`docs/superpowers/specs/2026-06-07-meeting-room-separation-design.md`
- 实施计划：`docs/superpowers/plans/2026-06-07-meeting-room-implementation.md`
