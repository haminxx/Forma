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

import { cn } from "@/lib/utils";

/**
 * Product-surface bento. Cards map 1:1 to the README's "What's Real
 * Today" section so a judge can scan the marketing page and see the
 * same architecture they'd find in the GitHub README.
 *
 * Per latest direction every card now carries a layered depth pass:
 *   - inner highlight ring (white/10 1px) for "lit edge" feel
 *   - outer drop shadow + warm-gold rim shadow on hover so the cards
 *     feel like raised glass on the gold backdrop
 *   - hover lift (-translate-y) + slight scale for tactile response
 * Re-usable via the `cardChrome` constant so every variant gets the
 * same depth without hand-tuning.
 */

const cardChrome =
  "h-full border border-white/10 bg-card/85 shadow-[0_18px_44px_-22px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[#d4b87a]/35 hover:shadow-[0_28px_64px_-22px_rgba(0,0,0,0.75),0_0_0_1px_rgba(212,184,122,0.25),inset_0_1px_0_rgba(255,255,255,0.10)]";

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
    <Card className={cn(cardChrome, "flex flex-col")}>
      <CardHeader className="space-y-2 p-5">
        <div
          className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#d4b87a]/20 text-[#d4b87a]"
          style={{
            boxShadow:
              "0 8px 18px -8px rgba(212,184,122,0.55), inset 0 0 0 1px rgba(212,184,122,0.30)",
          }}
        >
          <Chrome className="h-5 w-5" aria-hidden />
        </div>
        <CardTitle className="text-lg">Chrome extension</CardTitle>
        <CardDescription className="text-[13px] leading-snug">
          Sits inside your prompt workflow on v0.app. Vague UI words get a
          Grammarly-style underline; hover for the canonical term, click
          Accept, and the prompt rewrites with motion + a11y specs.
        </CardDescription>
      </CardHeader>
      <CardFooter className="mt-auto flex items-center justify-between p-5 pt-0">
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
    <Card className={cardChrome}>
      <CardContent className="flex h-full flex-col justify-between p-5">
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
                  ? "inline-flex items-center gap-1 rounded-full border border-[#d4b87a]/40 bg-[#d4b87a]/15 px-2 py-0.5 text-[11px] font-medium text-[#d4b87a] shadow-[0_2px_8px_-3px_rgba(212,184,122,0.6)]"
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
    <Card className={cardChrome}>
      <CardContent className="flex h-full flex-col justify-between p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base font-medium">
              Free tier · 8B
            </CardTitle>
            <CardDescription className="text-[12px]">
              Llama 3.1 8B · per-keystroke score
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className="border-[#d4b87a]/45 text-[#d4b87a] shadow-[0_0_12px_-4px_rgba(212,184,122,0.6)]"
          >
            Real-time
          </Badge>
        </div>
        <div className="flex items-baseline gap-2">
          <span
            className="text-5xl font-bold tabular-nums"
            style={{ textShadow: "0 2px 14px rgba(212,184,122,0.45)" }}
          >
            95
          </span>
          <span className="text-sm text-muted-foreground">/ 100</span>
        </div>
        <div className="flex justify-between text-[11px] text-muted-foreground">
          <span>Vague = 30</span>
          <span>One Accept = 95</span>
        </div>
      </CardContent>
    </Card>
  );
}

function StatisticCard() {
  return (
    <Card className={cn(cardChrome, "relative overflow-hidden")}>
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
        aria-hidden
      />
      <CardContent className="relative z-10 flex h-full flex-col items-center justify-center gap-1 p-5 text-center">
        <span
          className="text-4xl font-bold tabular-nums text-foreground/95 sm:text-5xl"
          style={{
            textShadow:
              "0 2px 18px rgba(212,184,122,0.55), 0 0 8px rgba(0,0,0,0.4)",
          }}
        >
          30 → 95
        </span>
        <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Prompt quality score
        </span>
      </CardContent>
    </Card>
  );
}

function ProductivityCard() {
  return (
    <Card className={cardChrome}>
      <CardContent className="flex h-full flex-col justify-between p-5">
        <div>
          <CardTitle className="text-base font-medium">
            Pro tier · 70B
          </CardTitle>
          <CardDescription className="text-[12px]">
            70B AWQ-INT4 · 7-agent consensus
          </CardDescription>
        </div>
        <ul className="mt-2 flex flex-wrap gap-1">
          {AGENTS.map((a) => (
            <li
              key={a}
              className="rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] tabular-nums text-white/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
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
    <Card className={cardChrome}>
      <CardContent className="flex h-full flex-wrap items-center justify-between gap-3 p-5">
        <div className="min-w-[12rem]">
          <CardTitle className="text-base font-medium">
            One MI300X · two tiers
          </CardTitle>
          <CardDescription className="text-[12px]">
            8B + 70B AWQ load together — H100 80GB cannot.
          </CardDescription>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span
              className="font-mono text-xl font-bold tabular-nums text-foreground"
              style={{ textShadow: "0 2px 12px rgba(212,184,122,0.4)" }}
            >
              89
              <span className="text-sm text-muted-foreground"> / 192</span>
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              GiB used
            </span>
          </div>
          <div className="h-9 w-1.5 rounded-full bg-white/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]">
            <div
              className="h-full w-full rounded-full"
              style={{
                background:
                  "linear-gradient(180deg, #d4b87a 0%, #d4b87a 47%, transparent 47%)",
                boxShadow: "0 0 10px rgba(212,184,122,0.7)",
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
       is the surface; richly-shadowed bento cards float on it for
       contrast. Headline is the section's own — no duplicated
       sub-headline. */
    <div className="w-full max-w-[min(calc(100vw-3rem),68rem)] text-foreground">
      <div className="mb-5 text-center sm:mb-6">
        <h2
          className="text-balance text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl"
          style={{
            color: "#191a1f",
            textShadow:
              "0 1px 0 rgba(255,255,255,0.25), 0 4px 18px rgba(0,0,0,0.20)",
          }}
        >
          Built on AMD MI300X.
        </h2>
        <p
          className="mt-1.5 text-xs sm:text-sm"
          style={{ color: "rgba(25,26,31,0.78)" }}
        >
          Free 8B + Pro 70B AWQ — both inference tiers live on one GPU.
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
