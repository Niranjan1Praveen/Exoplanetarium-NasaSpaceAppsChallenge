"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function FooterCta() {
  const [email, setEmail] = useState("")

  const handleSubmit = () => {
    console.log("Email submitted:", email)
  }

  return (
    <section className="w-full flex flex-col items-center text-center px-4 py-12 space-y-2">
      <h2 className="text-5xl font-bold ">
        Outrank Everyone. Starting Now.
      </h2>
      <p className="mt-2 text-md text-muted-foreground max-w-md">
        LOGO analyzes millions of data points to deliver predictive insights.
      </p>

      <div className="mt-6 flex w-full max-w-md items-center space-x-2">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button onClick={handleSubmit}>
          Try Demo
        </Button>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        No credit card required &nbsp; • &nbsp; 14-days free trial
      </p>
    </section>
  )
}
