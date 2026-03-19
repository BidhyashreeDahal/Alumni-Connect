import express from "express"
import request from "supertest"
import { beforeAll, describe, expect, it, vi } from "vitest"

vi.mock("../src/db/prisma.js", () => ({
  prisma: {
    $queryRaw: vi.fn().mockResolvedValue([{ "?column?": 1 }])
  }
}))

let systemRoutes

beforeAll(async () => {
  const module = await import("../src/routes/system.routes.js")
  systemRoutes = module.default
})

describe("system routes", () => {
  it("returns healthy status from /health", async () => {
    const app = express()
    app.use("/", systemRoutes)

    const response = await request(app).get("/health")

    expect(response.status).toBe(200)
    expect(response.body.status).toBe("ok")
    expect(response.body.service).toBe("alumni-connect-api")
  })

  it("returns ready status from /ready", async () => {
    const app = express()
    app.use("/", systemRoutes)

    const response = await request(app).get("/ready")

    expect(response.status).toBe(200)
    expect(response.body.status).toBe("ready")
    expect(response.body.database).toBe("ok")
  })
})
