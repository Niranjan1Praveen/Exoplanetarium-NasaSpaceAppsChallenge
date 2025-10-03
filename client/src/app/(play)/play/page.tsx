import { useMemo } from "react"
import { formatDate } from "@/lib/utils"
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler"

interface ChangelogData {
  title: string
  date: string
  version?: string
  tags?: string[]
  body: string 
}

interface ChangelogPage {
  url: string
  data: ChangelogData
}

// Example static changelog data
const changelogs: ChangelogPage[] = [
  {
    url: "/v1.2.0",
    data: {
      title: "Added new exoplanet classifier feature",
      date: "2025-10-03",
      version: "v1.2.0",
      tags: ["feature", "ml"],
      body: "Implemented the AI/ML model for automatic exoplanet detection with 73% accuracy."
    }
  },
  {
    url: "/v1.1.0",
    data: {
      title: "Initial release of the webapp",
      date: "2025-09-20",
      version: "v1.1.0",
      tags: ["release"],
      body: "First version of the exoplanet classifier webapp."
    }
  }
]

export default function HomePage() {
  const sortedChangelogs = useMemo(() => {
    return changelogs.sort((a, b) => {
      const dateA = new Date(a.data.date).getTime()
      const dateB = new Date(b.data.date).getTime()
      return dateB - dateA
    })
  }, [])

  return (
    <div className="min-h-screen bg-background relative">
      {/* Header */}
      <div className="border-b border-border/50">
        <div className="max-w-5xl mx-auto relative">
          <div className="p-3 flex items-center justify-between">
            <h1 className="text-3xl font-semibold tracking-tight">Changelog</h1>
            <AnimatedThemeToggler />
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="max-w-5xl mx-auto px-6 lg:px-10 pt-10">
        <div className="relative">
          {sortedChangelogs.map((changelog) => {
            const date = new Date(changelog.data.date)
            const formattedDate = formatDate(date)

            return (
              <div key={changelog.url} className="relative">
                <div className="flex flex-col md:flex-row gap-y-6">
                  <div className="md:w-48 flex-shrink-0">
                    <div className="md:sticky md:top-8 pb-10">
                      <time className="text-sm font-medium text-muted-foreground block mb-3">
                        {formattedDate}
                      </time>

                      {changelog.data.version && (
                        <div className="inline-flex relative z-10 items-center justify-center w-10 h-10 text-foreground border border-border rounded-lg text-sm font-bold">
                          {changelog.data.version}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right side - Content */}
                  <div className="flex-1 md:pl-8 relative pb-10">
                    {/* Vertical timeline line */}
                    <div className="hidden md:block absolute top-2 left-0 w-px h-full bg-border">
                      <div className="hidden md:block absolute -translate-x-1/2 size-3 bg-primary rounded-full z-10" />
                    </div>

                    <div className="space-y-6">
                      <div className="relative z-10 flex flex-col gap-2">
                        <h2 className="text-2xl font-semibold tracking-tight text-balance">
                          {changelog.data.title}
                        </h2>

                        
                      </div>

                      {/* Body */}
                      <div className="prose dark:prose-invert max-w-none prose-headings:scroll-mt-8 prose-headings:font-semibold prose-p:tracking-tight prose-p:text-balance">
                        {changelog.data.body}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
