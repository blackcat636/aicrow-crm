"use client"

import * as React from "react"
import { IconSun, IconMoon } from "@tabler/icons-react"
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
        <div className="flex items-center gap-2">
            <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 hover-lift group relative overflow-hidden transition-smooth"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
                <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                {theme === "light" ? (
                    <IconSun className="h-5 w-5 transition-all duration-500 rotate-0 group-hover:rotate-180 group-hover:scale-110" />
                ) : (
                    <IconMoon className="h-5 w-5 transition-all duration-500 rotate-0 group-hover:-rotate-12 group-hover:scale-110" />
                )}
                <span className="sr-only">Toggle theme</span>
            </Button>
        </div>
    )
}
