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
import { Chrome, ExternalLink } from "lucide-react";

/**
 * Product-surface bento. Cards map 1:1 to the README's "What's Real
 * Today" section so a judge can scan the marketing page and see the
 * same architecture they'd find in the GitHub README.
 *
 *   1. IntegrationCard  — Chrome extension on v0.app (shipped)
 *   2. TrackersCard     — Builders supported (v0 today, 4 next)
 *   3. StatisticCard    — Score moves 30 → 95 on the README example
 *   4. FocusCard        — Free tier 8B real-time precision
 *   5. ProductivityCard — Pro tier 70B 7-agent consensus
 *   6. ShortcutsCard    — VRAM headroom: 89 / 192 GiB on one MI300X
 */

const BUILDERS = [
  { name: "v0.app", live: true },
  { name: "Cursor", live: false },
  { name: "Lovable", live: false },
  { name: "Bolt", live: false },
  { name: "base44", live: false },
] as const;

const AGENTS = [
  "Detector",
  "Critic",
  "Reformulator",
  "Style",
  "Memory",
  "Coach",
  "Consensus",
] as const;

function IntegrationCard() {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#d4b87a]/20 text-[#d4b87a]">
          <Chrome className="h-6 w-6" aria-hidden />
        </div>
        <CardTitle>Chrome extension</CardTitle>
        <CardDescription>
          Forma sits inside the prompt workflow you already have. As you type
          on v0.app, vague UI vocabulary gets a Grammarly-style underline.
          Hover for the canonical term plus three alternatives, click Accept,
          and the prompt rewrites in place with concrete motion + a11y specs.
        </CardDescription>
      </CardHeader>
      <CardFooter className="mt-auto flex items-center justify-between">
        <Button variant="outline" size="sm" asChild>
          <a
            href="https://github.com/haminxx/Forma"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="h-4 w-4" />
            View source
          </a>
        </Button>
        <Switch
          aria-label="Inline detection enabled"
          defaultChecked
          className="data-[state=checked]:bg-[#d4b87a]"
        />
      </CardFooter>
    </Card>
  );
}

function TrackersCard() {
  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col justify-between p-6">
        <div>
          <CardTitle className="text-base font-medium">
            Builders supported
          </CardTitle>
          <CardDescription>
            v0.app today · 4 more on the v1.1 roadmap.
          </CardDescription>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {BUILDERS.map((b) => (
            <span
              key={b.name}
              className={
                b.live
                  ? "inline-flex items-center gap-1 rounded-full border border-[#d4b87a]/40 bg-[#d4b87a]/15 px-2 py-0.5 text-[11px] font-medium text-[#d4b87a]"
                  : "inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] font-medium text-white/45"
              }
            >
              {b.live ? (
                <span className="h-1.5 w-1.5 rounded-full bg-[#d4b87a]" />
              ) : null}
              {b.name}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function FocusCard() {
  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col justify-between p-6">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base font-medium">
              Free tier · 8B
            </CardTitle>
            <CardDescription>
              Llama 3.1 8B Instruct · per-keystroke score
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className="border-[#d4b87a]/45 text-[#d4b87a]"
          >
            Real-time
          </Badge>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-6xl font-bold tabular-nums">95</span>
          <span className="text-sm text-muted-foreground">/ 100</span>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Vague prompt = 30</span>
          <span>One Accept = 95</span>
        </div>
      </CardContent>
    </Card>
  );
}

function StatisticCard() {
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
      <CardContent className="relative z-10 flex h-full min-h-[140px] flex-col items-center justify-center gap-1 p-6 text-center">
        <span className="text-5xl font-bold tabular-nums text-foreground/95 sm:text-6xl">
          30 → 95
        </span>
        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Prompt quality score
        </span>
      </CardContent>
    </Card>
  );
}

function ProductivityCard() {
  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col justify-between p-6">
        <div>
          <CardTitle className="text-base font-medium">
            Pro tier · 70B
          </CardTitle>
          <CardDescription>
            Llama 3.1 70B AWQ-INT4 · 7-agent consensus
          </CardDescription>
        </div>
        <ul className="mt-3 flex flex-wrap gap-1">
          {AGENTS.map((a) => (
            <li
              key={a}
              className="rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] tabular-nums text-white/70"
            >
              {a}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function ShortcutsCard() {
  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-wrap items-center justify-between gap-4 p-6">
        <div className="min-w-[14rem]">
          <CardTitle className="text-base font-medium">
            One MI300X · two tiers, concurrent
          </CardTitle>
          <CardDescription>
            8B + 70B AWQ load together in 89 GiB of HBM3 — H100 80GB cannot.
          </CardDescription>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="font-mono text-2xl font-bold tabular-nums text-foreground">
              89
              <span className="text-base text-muted-foreground"> / 192</span>
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              GiB used
            </span>
          </div>
          <div className="h-10 w-1.5 rounded-full bg-white/10">
            <div
              className="h-full w-full rounded-full"
              style={{
                background:
                  "linear-gradient(180deg, #d4b87a 0%, #d4b87a 47%, transparent 47%)",
              }}
              aria-label="89 of 192 GiB used"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SolutionSection() {
  return (
    /* No inner panel: the section's gold radial backdrop in `Home.tsx`
       is the surface; dark bento cards float on it for contrast.
       Headline is the section's own — no duplicated sub-headline. */
    <div className="w-full max-w-[min(calc(100vw-3rem),72rem)] text-foreground">
      <div className="mb-8 text-center">
        <h2
          className="text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
          style={{
            color: "#191a1f",
            textShadow: "0 1px 0 rgba(255,255,255,0.18)",
          }}
        >
          Built on AMD MI300X.
        </h2>
        <p
          className="mt-2 text-sm sm:text-base"
          style={{ color: "rgba(25,26,31,0.72)" }}
        >
          Free 8B + Pro 70B AWQ — both inference tiers live on one GPU, in
          one product flow.
        </p>
      </div>

      <BentoGridShowcase
        integration={<IntegrationCard />}
        trackers={<TrackersCard />}
        statistic={<StatisticCard />}
        focus={<FocusCard />}
        productivity={<ProductivityCard />}
        shortcuts={<ShortcutsCard />}
      />
    </div>
  );
}
