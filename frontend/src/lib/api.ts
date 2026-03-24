import axios from "axios"
import { API_BASE_URL, attachCsrfInterceptor } from "./http"

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
})

attachCsrfInterceptor(api)