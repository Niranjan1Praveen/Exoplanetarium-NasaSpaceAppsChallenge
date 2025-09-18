"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export function Workflow() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Meet New-Gen <br className="hidden sm:inline" /> Research Experience
        </h2>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="grid gap-8 sm:grid-cols-2 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Backlink – Profile Analysis</CardTitle>
              <CardDescription>
                Uncover backlink sources, anchor texts, and authority scores to
                optimize your strategy and boost SEO.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-40 w-full rounded-md bg-muted" />
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="h-40 w-full rounded-md bg-muted" />
            </CardContent>
            <CardHeader>
              <CardTitle>Explore Shared SEO Keywords</CardTitle>
              <CardDescription>
                Rapidly pinpoint overlapping keywords between two websites for
                competitive SEO analysis and strategic planning.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card className="lg:col-span-2">
          <CardContent>
            <div className="h-60 w-full rounded-md bg-muted" />
            <CardHeader className="py-4 flex flex-col gap-4 items-center justify-center">
              <CardTitle>Analyze Ranked Keywords</CardTitle>
              <CardDescription>
                Analyze search volume, CTR, trends, and intent to optimize your
                SEO and Google Ads strategies.
              </CardDescription>
            </CardHeader>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
