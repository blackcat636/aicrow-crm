"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { createUser } from "@/lib/api/users"
import { useUsersStore } from "@/store/useUsersStore"

type Role = "user" | "admin"

interface FormData {
  email: string
  username: string
  password: string
  firstName: string
  lastName: string
  role: Role
  isEmailVerified: boolean
  isActive: boolean
}

export function CreateUserDialog() {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { fetchUsers, page, limit, search } = useUsersStore()

  const [form, setForm] = useState<FormData>({
    email: "",
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "user",
    isEmailVerified: false,
    isActive: true,
  })

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {}
  )

  // Basic client-side validation
  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!form.email || !emailRegex.test(form.email)) {
      newErrors.email = "Invalid email"
    }
    if (!form.username || form.username.trim().length < 3) {
      newErrors.username = "Username must be at least 3 characters"
    }
    if (!form.password || form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    }
    if (!form.firstName.trim()) {
      newErrors.firstName = "First name is required"
    }
    if (!form.lastName.trim()) {
      newErrors.lastName = "Last name is required"
    }
    if (!form.role) {
      newErrors.role = "Role is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const resetForm = () => {
    setForm({
      email: "",
      username: "",
      password: "",
      firstName: "",
      lastName: "",
      role: "user",
      isEmailVerified: false,
      isActive: true,
    })
    setErrors({})
  }

  const handleSubmit = async () => {
    if (!validate()) return
    try {
      setIsSubmitting(true)
      await createUser({
        email: form.email.trim(),
        username: form.username.trim(),
        password: form.password,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        role: form.role,
        isEmailVerified: form.isEmailVerified,
        isActive: form.isActive,
      })
      toast.success("User created successfully")
      setOpen(false)
      resetForm()
      await fetchUsers(page, limit, search)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create user"
      toast.error(message)
      // Optionally map unique constraints to specific fields
      if (message.toLowerCase().includes("email")) {
        setErrors((prev) => ({ ...prev, email: "Email is already taken" }))
      }
      if (message.toLowerCase().includes("username") || message.toLowerCase().includes("логін")) {
        setErrors((prev) => ({ ...prev, username: "Username is already taken" }))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new user</DialogTitle>
          <DialogDescription>
            Fill out the fields below to create a user as an administrator.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="new.user@example.com"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
            {errors.email ? (
              <p className="text-xs text-red-500">{errors.email}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="new.user"
              value={form.username}
              onChange={(e) =>
                setForm((f) => ({ ...f, username: e.target.value }))
              }
            />
            {errors.username ? (
              <p className="text-xs text-red-500">{errors.username}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="SecurePass123!"
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
            />
            {errors.password ? (
              <p className="text-xs text-red-500">{errors.password}</p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                placeholder="New"
                value={form.firstName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, firstName: e.target.value }))
                }
              />
              {errors.firstName ? (
                <p className="text-xs text-red-500">{errors.firstName}</p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                placeholder="User"
                value={form.lastName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, lastName: e.target.value }))
                }
              />
              {errors.lastName ? (
                <p className="text-xs text-red-500">{errors.lastName}</p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Role</Label>
            <Select
              value={form.role}
              onValueChange={(value) =>
                setForm((f) => ({ ...f, role: value as Role }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrator</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
            {errors.role ? (
              <p className="text-xs text-red-500">{errors.role}</p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between rounded-md border p-3">
              <div className="space-y-0.5">
                <Label>Email verified</Label>
                <p className="text-xs text-muted-foreground">
                  Mark if the email is already verified.
                </p>
              </div>
              <Switch
                checked={form.isEmailVerified}
                onCheckedChange={(checked) =>
                  setForm((f) => ({ ...f, isEmailVerified: !!checked }))
                }
              />
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <div className="space-y-0.5">
                <Label>Active</Label>
                <p className="text-xs text-muted-foreground">
                  User is active and can sign in.
                </p>
              </div>
              <Switch
                checked={form.isActive}
                onCheckedChange={(checked) =>
                  setForm((f) => ({ ...f, isActive: !!checked }))
                }
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


