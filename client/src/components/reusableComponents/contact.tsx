"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCheck } from "lucide-react"

export default function Contact() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-16">
      {/* Header */}
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          Need Assistance or Have Questions?
        </h1>
        <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
          Get in touch with the Exoplanetarium team for guidance on research, classroom use, or technical support.
        </p>
      </section>

      {/* Top Cards: Research & Support */}
      <section className="grid gap-6 md:grid-cols-2 mb-16">
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle>Research Assistance</CardTitle>
            <CardDescription>
              Speak to our experts for help with exoplanet simulations, data analysis, or project guidance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="#">Talk to research team</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle>Help & Support</CardTitle>
            <CardDescription>
              Ask questions about Exoplanetarium features, report issues, or share feedback.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="#">Contact support</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Lower Links */}
      <section className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2">
        <div>
          <h3 className="font-semibold mb-1">Join the Community</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Collaborate with other students and researchers, share findings, and discuss exoplanet discoveries.
          </p>
          <Link href="#" className="text-sm underline">
            Join the forum
          </Link>
        </div>

        <div>
          <h3 className="font-semibold mb-1">General Communication</h3>
          <p className="text-sm text-muted-foreground mb-2">
            For any general inquiries, get in touch via email.
          </p>
          <a
            href="mailto:hello@exoplanetarium.com"
            className="text-sm underline break-all"
          >
            hello@exoplanetarium.com
          </a>
        </div>

        <div>
          <h3 className="font-semibold mb-1">Documentation</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Explore tutorials, guides, and technical documentation for Exoplanetarium tools.
          </p>
          <Link href="#" className="text-sm underline">
            Exoplanetarium Docs
          </Link>
        </div>

        <div>
          <h3 className="font-semibold mb-1">Developers</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Learn how to integrate Exoplanetarium data and tools into your own applications.
          </p>
          <Link href="#" className="text-sm underline">
            API & SDK
          </Link>
        </div>
      </section>

      {/* Status footer */}
      <div className="mt-16 flex items-center justify-center gap-2 text-center text-sm text-muted-foreground">
        <CheckCheck size={20}/>
        All systems operational
      </div>
    </main>
  )
}
