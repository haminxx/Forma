import { useId, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { BentoGridShowcase } from "@/components/ui/bento-product-features";
import { cn } from "@/lib/utils";
import { Command, Plus, Settings2, Users } from "lucide-react";

export type Audience = "b2c" | "b2b";

const B2C_TRACKERS = [
  "https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?auto=format&fit=crop&w=100&q=80",
  "https://images.unsplash.com/photo-1550525811-e5869dd03032?auto=format&fit=crop&w=100&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80",
] as const;

const B2B_TRACKERS = [
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=100&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80",
] as const;

function IntegrationCard({ audience }: { audience: Audience }) {
  const isB2c = audience === "b2c";
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/20 text-orange-100">
          {isB2c ? (
            <span className="text-3xl" role="img" aria-label="sparkles">
              ✳️
            </span>
          ) : (
            <Users className="h-6 w-6 text-orange-200" aria-hidden />
          )}
        </div>
        <CardTitle>
          {isB2c ? "Browser extension" : "Workspace integration"}
        </CardTitle>
        <CardDescription>
          {isB2c
            ? "Highlight vague UI words as you prompt in the browser, accept precise replacements in one click, and keep your flow inside ChatGPT, Lovable, and every vibe-coding surface."
            : "Connect Forma to your org: shared vocabulary packs, review workflows in CI, and a single source of truth so product, design, and eng mean the same thing by default."}
        </CardDescription>
      </CardHeader>
      <CardFooter className="mt-auto flex items-center justify-between">
        <Button variant="outline" size="sm">
          <Settings2 className="h-4 w-4" />
          Configure
        </Button>
        <Switch
          className="data-[state=checked]:bg-red-500"
          aria-label={isB2c ? "Extension active" : "Workspace link active"}
          defaultChecked
        />
      </CardFooter>
    </Card>
  );
}

function TrackersCard({ audience }: { audience: Audience }) {
  const isB2c = audience === "b2c";
  const srcs = isB2c ? B2C_TRACKERS : B2B_TRACKERS;
  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col justify-between p-6">
        <div>
          <CardTitle className="text-base font-medium">
            {isB2c ? "Packs in use" : "Teams connected"}
          </CardTitle>
          <CardDescription>
            {isB2c ? "03 active vocabulary packs" : "08 workspaces on Pro"}
          </CardDescription>
        </div>
        <div className="flex -space-x-2 overflow-hidden">
          {srcs.map((src) => (
            <img
              key={src}
              className="inline-block h-8 w-8 rounded-full ring-2 ring-background object-cover"
              src={src}
              alt=""
              loading="lazy"
              width={32}
              height={32}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function FocusCard({ audience }: { audience: Audience }) {
  const isB2c = audience === "b2c";
  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col justify-between p-6">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base font-medium">
              {isB2c ? "Prompt precision" : "Definition coverage"}
            </CardTitle>
            <CardDescription>
              {isB2c
                ? "How often you ship unambiguous UI terms"
                : "Shared terms adopted across repos"}
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className="border-orange-300/60 text-orange-200"
          >
            {isB2c ? "Clarity index" : "Adoption"}
          </Badge>
        </div>
        <div>
          <span className="text-6xl font-bold tabular-nums">
            {isB2c ? "42%" : "86%"}
          </span>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{isB2c ? "Fewer re-prompts" : "Specs aligned"}</span>
          <span>{isB2c ? "Rolling average" : "Last sprint"}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function StatisticCard({ audience }: { audience: Audience }) {
  const label = audience === "b2c" ? "10X" : "3X";
  return (
    <Card className="relative h-full w-full overflow-hidden">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
        aria-hidden
      />
      <CardContent className="relative z-10 flex h-full min-h-[140px] items-center justify-center p-6">
        <span className="text-7xl font-bold text-foreground/90 sm:text-8xl">
          {label}
        </span>
      </CardContent>
    </Card>
  );
}

function ProductivityCard({ audience }: { audience: Audience }) {
  const isB2c = audience === "b2c";
  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col justify-end p-6">
        <CardTitle className="text-base font-medium">
          {isB2c ? "Solo builder velocity" : "Team review throughput"}
        </CardTitle>
        <CardDescription>
          {isB2c
            ? "Spend less time decoding what the model thought you meant — more time iterating on the right component."
            : "Cut cross-team churn: one vocabulary, automated nudges in PRs, and reviewers who see the same component language."}
        </CardDescription>
      </CardContent>
    </Card>
  );
}

function ShortcutsCard({ audience }: { audience: Audience }) {
  const isB2c = audience === "b2c";
  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-wrap items-center justify-between gap-4 p-6">
        <div className="min-w-[12rem]">
          <CardTitle className="text-base font-medium">
            {isB2c ? "Shortcut keys" : "Power shortcuts"}
          </CardTitle>
          <CardDescription>
            {isB2c
              ? "Accept suggestions and skip noise without leaving the keyboard."
              : "Bulk-apply pack rules and export briefs from the CLI or editor."}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background font-mono text-xs font-medium text-muted-foreground">
            <Command className="h-3 w-3" aria-hidden />
          </div>
          <Plus className="h-3 w-3 text-muted-foreground" aria-hidden />
          <div className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background font-mono text-xs font-medium text-muted-foreground">
            {isB2c ? "K" : "R"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatLabel({ audience }: { audience: Audience }) {
  const isB2c = audience === "b2c";
  return (
    <p className="mt-3 max-w-2xl text-center text-lg text-muted-foreground">
      {isB2c
        ? "Personal precision for builders who live in AI IDEs — catch vague UI language before it ships."
        : "Operational rigor for teams — standardize vocabulary, measure adoption, and review with shared intent."}
    </p>
  );
}

export function SolutionSection() {
  const [audience, setAudience] = useState<Audience>("b2c");
  const groupId = useId();

  return (
    <div className="w-full max-w-[min(calc(100vw-3rem),72rem)] text-foreground">
      <div className="mb-6 text-center">
        <h2 className="text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
          The solution
        </h2>
        <p className="mt-2 text-sm text-white/55 sm:text-base">
          Product surfaces — pick how you ship with Forma.
        </p>
      </div>

      <div className="mb-10 flex flex-col items-center gap-4">
        <div
          role="group"
          aria-labelledby={`${groupId}-label`}
          className="inline-flex rounded-full border border-white/15 bg-white/[0.06] p-1"
        >
          <span id={`${groupId}-label`} className="sr-only">
            Audience
          </span>
          <button
            type="button"
            className={cn(
              "rounded-full px-6 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#191a1f]",
              audience === "b2c"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-white/65 hover:text-white",
            )}
            aria-pressed={audience === "b2c"}
            onClick={() => setAudience("b2c")}
          >
            B2C
          </button>
          <button
            type="button"
            className={cn(
              "rounded-full px-6 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#191a1f]",
              audience === "b2b"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-white/65 hover:text-white",
            )}
            aria-pressed={audience === "b2b"}
            onClick={() => setAudience("b2b")}
          >
            B2B
          </button>
        </div>

        <div className="w-full rounded-2xl border border-border bg-card/80 px-6 py-8 shadow-sm backdrop-blur-sm sm:px-10">
          <div className="mb-8">
            <h3 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
              {audience === "b2c"
                ? "Built for individual builders"
                : "Built for teams and orgs"}
            </h3>
            <StatLabel audience={audience} />
          </div>

          <BentoGridShowcase
            key={audience}
            integration={<IntegrationCard audience={audience} />}
            trackers={<TrackersCard audience={audience} />}
            statistic={<StatisticCard audience={audience} />}
            focus={<FocusCard audience={audience} />}
            productivity={<ProductivityCard audience={audience} />}
            shortcuts={<ShortcutsCard audience={audience} />}
          />
        </div>
      </div>
    </div>
  );
}
