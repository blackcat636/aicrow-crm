"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { setTokens } from "@/lib/auth"
import { useUserStore } from "@/store/useUserStore"
import { login } from "@/lib/api"

// interface LoginResponse {
//     accessToken: string;
//     refreshToken: string;
//     deviceId: string;
//     user: User;
// }

export function LoginForm() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isClient, setIsClient] = useState(false)
    const router = useRouter()
    const { setUser } = useUserStore()

    useEffect(() => {
        setIsClient(true)
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        try {
            const data = await login(email, password)
            setTokens({
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
                deviceId: data.deviceId,
            })
            setUser(data.user)
            
            // Redirect to users page after login
            router.push('/users')
        } catch (err) {
            setError(err instanceof Error ? err.message : "Authentication error")
        } finally {
            setIsLoading(false)
        }
    }

    if (!isClient) {
        return null
    }

    return (
        <div className="w-full max-w-md space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold">Sign in to system</h2>
                <p className="mt-2 text-sm text-gray-600">
                    Enter your credentials to access the system
                </p>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                </div>
                {error && (
                    <div className="text-red-500 text-sm bg-red-50 p-2 rounded">
                        {error}
                    </div>
                )}
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Loading..." : "Sign in"}
                </Button>
            </form>
        </div>
    )
} 
