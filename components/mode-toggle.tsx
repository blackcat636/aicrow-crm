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
                className="h-9 w-9"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
                {theme === "light" ? (
                    <IconSun className="h-5 w-5" />
                ) : (
                    <IconMoon className="h-5 w-5" />
                )}
                <span className="sr-only">Toggle theme</span>
            </Button>
        </div>
    )
}
