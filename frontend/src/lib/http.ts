import type { AxiosInstance, InternalAxiosRequestConfig } from "axios"

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

const CSRF_ENDPOINT = `${API_BASE_URL}/auth/csrf`
const CSRF_HEADER_NAME = "x-csrf-token"

let csrfToken: string | null = null
let csrfPromise: Promise<string> | null = null
let fetchShimInstalled = false

function isUnsafeMethod(method?: string | null) {
  const normalized = String(method || "GET").toUpperCase()
  return !["GET", "HEAD", "OPTIONS"].includes(normalized)
}

function isApiUrl(url: string) {
  return url.startsWith(API_BASE_URL)
}

async function fetchCsrfToken(nativeFetch: typeof window.fetch) {
  const response = await nativeFetch(CSRF_ENDPOINT, {
    method: "GET",
    credentials: "include"
  })

  const data = await response.json()
  if (!response.ok || !data?.csrfToken) {
    throw new Error(data?.message || "Failed to fetch CSRF token")
  }

  csrfToken = data.csrfToken
  return data.csrfToken as string
}

export async function ensureCsrfToken(nativeFetch: typeof window.fetch = window.fetch.bind(window)) {
  if (csrfToken !== null) return csrfToken
  if (csrfPromise) return csrfPromise

  csrfPromise = fetchCsrfToken(nativeFetch)
  try {
    return await csrfPromise
  } finally {
    csrfPromise = null
  }
}

export function clearCsrfToken() {
  csrfToken = null
  csrfPromise = null
}

export function attachCsrfInterceptor(instance: AxiosInstance) {
  instance.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    if (isUnsafeMethod(config.method)) {
      const token = await ensureCsrfToken()
      config.headers.set(CSRF_HEADER_NAME, token)
    }

    return config
  })

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error?.response?.status === 403 && error?.response?.data?.code === "CSRF_MISMATCH") {
        clearCsrfToken()
      }

      return Promise.reject(error)
    }
  )
}

export function installApiFetchCsrfShim() {
  if (fetchShimInstalled) return
  fetchShimInstalled = true

  const nativeFetch = window.fetch.bind(window)

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const request = new Request(input, init)
    const needsCsrf = isUnsafeMethod(request.method) && isApiUrl(request.url)

    if (!needsCsrf) {
      return nativeFetch(request)
    }

    const token = await ensureCsrfToken(nativeFetch)
    const headers = new Headers(request.headers)
    headers.set(CSRF_HEADER_NAME, token)

    return nativeFetch(new Request(request, { headers }))
  }
}
