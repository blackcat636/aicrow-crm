"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { setTokens } from "@/lib/auth"
import { useUserStore } from "@/store/useUserStore"
import { register } from "@/lib/api"

export function RegisterForm() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: ""
    })
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isClient, setIsClient] = useState(false)
    const router = useRouter()
    const { setUser } = useUserStore()

    useEffect(() => {
        setIsClient(true)
    }, [])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match")
            setIsLoading(false)
            return
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters long")
            setIsLoading(false)
            return
        }

        try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { confirmPassword, ...userData } = formData
            const data = await register(userData)
            
            // Handle the new API response structure
            if (data.user) {
                setTokens({
                    accessToken: data.accessToken,
                    refreshToken: data.refreshToken,
                    deviceId: data.deviceId,
                })
                setUser(data.user)
                router.push("/users")
            } else {
                // Fallback for old response format
                setTokens({
                    accessToken: data.accessToken,
                    refreshToken: data.refreshToken,
                    deviceId: data.deviceId,
                })
                setUser(data.user)
                router.push("/users")
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Registration error")
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
                <h2 className="text-2xl font-bold">Create your account</h2>
                <p className="mt-2 text-sm text-gray-600">
                    Already have an account?{" "}
                    <button
                        onClick={() => router.push("/login")}
                        className="font-medium text-primary hover:text-primary/80 transition-colors duration-200"
                    >
                        Sign in here
                    </button>
                </p>
            </div>
            <form className="mt-8 space-y-6 transition-all duration-300" onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            className="mt-1 transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>

                    <div>
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            required
                            value={formData.password}
                            onChange={handleInputChange}
                            className="mt-1 transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>

                    <div>
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            autoComplete="new-password"
                            required
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className="mt-1 transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>
                </div>

                {error && (
                    <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">
                        {error}
                    </div>
                )}

                <div>
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {isLoading ? "Creating account..." : "Create Account"}
                    </Button>
                </div>
            </form>
        </div>
    )
}
