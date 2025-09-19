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
          How can we help?
        </h1>
        <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
          Get in touch with our sales and support teams for demos, onboarding support, or product questions.
        </p>
      </section>

      {/* Top Cards: Sales & Support */}
      <section className="grid gap-6 md:grid-cols-2 mb-16">
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle>Sales</CardTitle>
            <CardDescription>
              Speak to our sales team about plans, pricing, enterprise contracts, or request a demo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="#">Talk to sales</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle>Help &amp; support</CardTitle>
            <CardDescription>
              Ask product questions, report problems, or leave feedback.
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
          <h3 className="font-semibold mb-1">Join the community</h3>
          <p className="text-sm text-muted-foreground mb-2">
            More than 15,000 Linear users share questions and best practices in our Slack community.
          </p>
          <Link href="#" className="text-sm underline">
            Join Slack
          </Link>
        </div>

        <div>
          <h3 className="font-semibold mb-1">General communication</h3>
          <p className="text-sm text-muted-foreground mb-2">
            For other queries, please get in touch with us via email.
          </p>
          <a
            href="mailto:hello@linear.app"
            className="text-sm underline break-all"
          >
            hello@linear.app
          </a>
        </div>

        <div>
          <h3 className="font-semibold mb-1">Documentation</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Get an overview of Linear&apos;s features, integrations, and how to use them.
          </p>
          <Link href="#" className="text-sm underline">
            Linear Docs
          </Link>
        </div>

        <div>
          <h3 className="font-semibold mb-1">Developers</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Learn how to use the GraphQL API and TypeScript SDK to extend Linear.
          </p>
          <Link href="#" className="text-sm underline">
            Linear API
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
