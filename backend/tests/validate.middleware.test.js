import express from "express"
import request from "supertest"
import { z } from "zod"
import { describe, expect, it } from "vitest"
import { errorHandler } from "../src/middleware/error.middleware.js"
import { validate } from "../src/middleware/validate.middleware.js"

describe("validate middleware", () => {
  it("parses query params without reassigning req.query", async () => {
    const app = express()

    app.get(
      "/items",
      validate({
        query: z.object({
          page: z.coerce.number().int().min(1)
        })
      }),
      (req, res) => {
        res.json({
          page: req.query.page,
          type: typeof req.query.page
        })
      }
    )
    app.use(errorHandler)

    const response = await request(app).get("/items?page=2")

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      page: 2,
      type: "number"
    })
  })
})
