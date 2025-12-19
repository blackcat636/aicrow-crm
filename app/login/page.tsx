export const runtime = 'edge';
import { GalleryVerticalEnd } from "lucide-react"
import Image from "next/image"

import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2 relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-primary animate-gradient opacity-10 pointer-events-none" />
      
      <div className="flex flex-col gap-4 p-6 md:p-10 relative z-10 animate-fade-in-up">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium group hover-lift transition-all duration-300">
            <div className="bg-gradient-primary text-white flex size-8 items-center justify-center rounded-lg shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
              <GalleryVerticalEnd className="size-5 transition-transform duration-300 group-hover:rotate-12" />
            </div>
            <span className="text-lg bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              AiPills
            </span>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <div className="card-hover p-8 rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl">
              <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  Welcome Back
                </h1>
                <p className="text-muted-foreground mt-2">
                  Sign in to your account to continue
                </p>
              </div>
              <LoginForm />
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20 relative hidden lg:block overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary animate-gradient opacity-30" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="max-w-lg text-center animate-float">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Modern CRM Solution
            </h2>
            <p className="text-lg text-muted-foreground">
              Manage your business with powerful tools and beautiful design
            </p>
          </div>
        </div>
        <Image
          src="/placeholder.svg"
          alt="Image"
          width={800}
          height={600}
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale opacity-10"
        />
      </div>
    </div>
  )
}
