"use client"

import * as React from "react"
import {Moon, Sun} from "lucide-react"
import {useTheme} from "next-themes"

import {Button} from "@/components/ui/button"
import {
} from "@/components/ui/dropdown-menu"

export function ModeToggle() {
    const {setTheme, theme} = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return null
    }

    return (
        <div>
            <Button variant="outline" size="icon" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
                <Sun className={`h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all ${
                    theme === "dark" ? "-rotate-90 scale-0" : ""
                }`}/>
                <Moon className={`absolute h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all ${
                    theme === "light" ? "rotate-90 scale-0" : ""
                }`}/>
                <span className="sr-only">Toggle theme</span>
            </Button>
            <div className="text-sm text-muted-foreground">
                {theme === "light" ? "Light" : theme === "dark" ? "Dark" : "System"}
            </div>
        </div>
    )
}
