import cookieParser from "cookie-parser"
import express from "express"
import request from "supertest"
import { describe, expect, it } from "vitest"
import { errorHandler } from "../src/middleware/error.middleware.js"
import { getCsrfToken, requireCsrfProtection } from "../src/middleware/csrf.middleware.js"

function buildApp() {
  const app = express()
  app.use(express.json())
  app.use(cookieParser())
  app.get("/auth/csrf", getCsrfToken)
  app.post("/protected", requireCsrfProtection, (_req, res) => {
    res.json({ ok: true })
  })
  app.use(errorHandler)
  return app
}

describe("csrf middleware", () => {
  it("blocks unsafe requests without a matching csrf token", async () => {
    const app = buildApp()

    const response = await request(app)
      .post("/protected")
      .send({ hello: "world" })

    expect(response.status).toBe(403)
    expect(response.body.code).toBe("CSRF_MISMATCH")
  })

  it("allows unsafe requests with matching csrf cookie and header", async () => {
    const app = buildApp()

    const csrfResponse = await request(app).get("/auth/csrf")
    const csrfToken = csrfResponse.body.csrfToken
    const csrfCookie = csrfResponse.headers["set-cookie"][0].split(";")[0]

    const response = await request(app)
      .post("/protected")
      .set("Cookie", csrfCookie)
      .set("x-csrf-token", csrfToken)
      .send({ hello: "world" })

    expect(response.status).toBe(200)
    expect(response.body.ok).toBe(true)
  })
})
