import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ModeToggle } from "@/components/mode-toggle"

export function SiteHeader() {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b border-border/50 backdrop-blur-xl bg-background/80 dark:bg-[#031138]/60 dark:backdrop-blur-xl dark:border-white/10 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) sticky top-0 z-40">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6 animate-fade-in-up">
        <SidebarTrigger className="-ml-1 hover-lift hover:bg-accent/80 transition-all duration-300 hover:scale-105" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4 bg-gradient-to-b from-transparent via-border to-transparent"
        />
        <h1 className="text-base font-medium bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
          Documents
        </h1>
        <div className="ml-auto flex items-center gap-2">
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
