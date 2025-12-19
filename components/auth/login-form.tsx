"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
            const result = await login(email, password)
            
            if (result.success && result.user) {
                setUser(result.user)
                
                // Redirect to users page after login
                router.push('/users')
            } else {
                setError(result.message || "Authentication error")
            }
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
        <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
                <div className="animate-fade-in-up" style={{ animationDelay: '50ms' }}>
                    <Label htmlFor="email" className="text-sm font-medium">
                        Email Address
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                        className="mt-1.5"
                    />
                </div>
                <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                    <Label htmlFor="password" className="text-sm font-medium">
                        Password
                    </Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                        className="mt-1.5"
                    />
                </div>
            </div>
            {error && (
                <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-lg border border-destructive/20 animate-fade-in-up">
                    {error}
                </div>
            )}
            <Button 
                type="submit" 
                className="w-full bg-gradient-primary hover:opacity-90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in-up" 
                disabled={isLoading}
                style={{ animationDelay: '150ms' }}
            >
                {isLoading ? (
                    <span className="flex items-center gap-2">
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Signing in...
                    </span>
                ) : (
                    "Sign in"
                )}
            </Button>
        </form>
    )
} 
