import { useState } from "react"
import { api } from "@/lib/api"
import { useNavigate } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()

  async function handleLogin(e: any) {
    e.preventDefault()

    await api.post("/auth/login", {
      email,
      password
    })

    navigate("/dashboard")
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <form
        onSubmit={handleLogin}
        className="w-96 p-8 bg-white rounded-xl shadow"
      >
        <h1 className="text-2xl font-semibold mb-6">
          Alumni Connect Login
        </h1>

        <Input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4"
        />

        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-6"
        />

        <Button className="w-full">
          Login
        </Button>
      </form>
    </div>
  )
}