# Express TypeScript Service Template

一个可以从 monorepo 中直接抽离的轻量 Express + TypeScript 服务模板。

模板不引用仓库外部的 `common-tools`、`common-defines`、`components` 或其他业务模块；复制整个目录到新项目后，安装自身依赖即可运行。

## 快速启动

```bash
cd express-ts-template
npm install
cp .env.example .env
npm run dev
```

默认监听 `3020` 端口：

```bash
curl http://127.0.0.1:3020/api/health
curl http://127.0.0.1:3020/api/v1/examples/demo
curl http://127.0.0.1:3020/internal/health
```

## 基础能力

### 错误处理

- `basic/error.ts`：统一 `ApiError`。
- `basic/errors.ts`：基础错误码。
- `middleware/error.ts`：统一 JSON 错误响应。
- `basic/asyncHandler.ts`：捕获同步和异步 Controller 异常。

业务代码可以直接抛出：

```ts
throw new ApiError(Codes.invalidParams, 'invalid request');
```

### Redis 缓存和 `@AutoCache`

缓存默认关闭，设置 `REDIS_ENABLED=true` 后启用。Redis 使用懒连接，不会因为导入模块或运行测试而自动连接外部服务。

```ts
@AutoCache('example:${0}', 60)
async get(id: string, options?: CacheOptions) {
    // cache miss 时执行
}
```

支持：

- `${0}`、`${1}` 等方法参数占位符。
- 默认 TTL 和 `{ ex: 0 }` 永不过期。
- 最后一个参数传 `{ refresh: true }` 强制回源刷新。
- Redis 读写失败时自动回源，不阻断业务请求。

### BullMQ 队列

`queue/exampleQueue.ts` 包含 Queue、Worker、失败事件、并发数和优雅关闭示例。BullMQ 使用独立的 `QUEUE_REDIS_URL`，不会复用缓存 Redis 的 key prefix。

```bash
export QUEUE_ENABLED=true
export QUEUE_WORKER_ENABLED=true
npm run dev
```

提交示例任务：

```bash
curl -X POST http://127.0.0.1:3020/api/v1/examples/jobs \
  -H 'Content-Type: application/json' \
  -d '{"id":"demo"}'
```

### Token 校验

`middleware/token.ts` 提供 JWT token 校验：

- 全局 `optionalToken()`：支持无 token 访问，有 token 时验证并注入 `req.user`。
- 路由级 `requireToken()`：要求登录。
- 支持 `Authorization: Bearer <jwt>` 和 `x-moji-token`。

示例受保护接口：`GET /api/v1/examples/private`。

设置 `TOKEN_SECRET` 后才会验证 JWT。若新服务使用 Session Token、OAuth 或其他认证协议，只需要替换该文件中的 token provider。

## 目录结构

```text
express-ts-template/
├── app.ts                         # Express 应用组装
├── index.ts                       # 启动、资源初始化和优雅退出
├── router.ts                      # 公共 API 路由
├── internal_router.ts             # 内部 API 路由
├── config/config.ts               # 环境变量配置
├── basic/
│   ├── asyncHandler.ts            # 异步路由包装
│   ├── decorator.ts               # @AutoCache
│   ├── error.ts                   # ApiError
│   ├── errors.ts                  # 错误码
│   ├── logger.ts                  # 轻量结构化日志
│   ├── route.ts                   # Request / Response 类型
│   ├── schemaOptions.ts           # Mongoose 通用 Schema 配置
│   └── utils.ts                   # Zod 参数校验和 Mongoose 类型辅助
├── cache/redis.ts                 # Redis 缓存客户端
├── middleware/
│   ├── error.ts                   # 错误处理中间件
│   ├── requestLogger.ts           # HTTP 请求日志
│   └── token.ts                   # optionalToken / requireToken
├── queue/exampleQueue.ts          # BullMQ Queue + Worker
├── controllers/                   # Controller
├── services/                      # Service
├── models/                        # Typegoose Model
├── tests/                         # Vitest + Supertest
├── .env.example
├── package.json
└── tsconfig.json
```

## 常用命令

```bash
npm run dev        # 开发启动
npm test           # 运行测试
npm run typecheck  # TypeScript 检查
npm run lint       # ESLint 检查
```

模板只包含通用能力和示例业务，不包含数据库连接初始化、具体业务鉴权或生产密钥。
