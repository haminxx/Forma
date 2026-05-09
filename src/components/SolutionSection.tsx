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
import { Command, Plus, Settings2 } from "lucide-react";

const TRACKER_AVATARS = [
  "https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?auto=format&fit=crop&w=100&q=80",
  "https://images.unsplash.com/photo-1550525811-e5869dd03032?auto=format&fit=crop&w=100&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80",
] as const;

function IntegrationCard() {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/20 text-orange-100">
          <span className="text-3xl" role="img" aria-label="sparkles">
            ✳️
          </span>
        </div>
        <CardTitle>Browser extension</CardTitle>
        <CardDescription>
          Highlight vague UI words as you prompt in the browser, accept precise
          replacements in one click, and keep your flow inside ChatGPT, Lovable,
          and every vibe-coding surface.
        </CardDescription>
      </CardHeader>
      <CardFooter className="mt-auto flex items-center justify-between">
        <Button variant="outline" size="sm">
          <Settings2 className="h-4 w-4" />
          Configure
        </Button>
        <Switch
          className="data-[state=checked]:bg-red-500"
          aria-label="Extension active"
          defaultChecked
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
          <CardTitle className="text-base font-medium">Packs in use</CardTitle>
          <CardDescription>03 active vocabulary packs</CardDescription>
        </div>
        <div className="flex -space-x-2 overflow-hidden">
          {TRACKER_AVATARS.map((src) => (
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

function FocusCard() {
  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col justify-between p-6">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base font-medium">
              Prompt precision
            </CardTitle>
            <CardDescription>
              How often you ship unambiguous UI terms
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className="border-orange-300/60 text-orange-200"
          >
            Clarity index
          </Badge>
        </div>
        <div>
          <span className="text-6xl font-bold tabular-nums">42%</span>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Fewer re-prompts</span>
          <span>Rolling average</span>
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
      <CardContent className="relative z-10 flex h-full min-h-[140px] items-center justify-center p-6">
        <span className="text-7xl font-bold text-foreground/90 sm:text-8xl">
          10X
        </span>
      </CardContent>
    </Card>
  );
}

function ProductivityCard() {
  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col justify-end p-6">
        <CardTitle className="text-base font-medium">
          Solo builder velocity
        </CardTitle>
        <CardDescription>
          Spend less time decoding what the model thought you meant — more time
          iterating on the right component.
        </CardDescription>
      </CardContent>
    </Card>
  );
}

function ShortcutsCard() {
  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-wrap items-center justify-between gap-4 p-6">
        <div className="min-w-[12rem]">
          <CardTitle className="text-base font-medium">Shortcut keys</CardTitle>
          <CardDescription>
            Accept suggestions and skip noise without leaving the keyboard.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background font-mono text-xs font-medium text-muted-foreground">
            <Command className="h-3 w-3" aria-hidden />
          </div>
          <Plus className="h-3 w-3 text-muted-foreground" aria-hidden />
          <div className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background font-mono text-xs font-medium text-muted-foreground">
            K
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SolutionSection() {
  return (
    <div className="w-full max-w-[min(calc(100vw-3rem),72rem)] text-foreground">
      <div className="mb-6 text-center">
        <h2 className="text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
          The solution
        </h2>
        <p className="mt-2 text-sm text-white/55 sm:text-base">
          Product surfaces — how you ship with Forma.
        </p>
      </div>

      <div className="mb-10 w-full rounded-2xl border border-border bg-card/80 px-6 py-8 shadow-sm backdrop-blur-sm sm:px-10">
        <div className="mb-8 text-center">
          <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Built for individual builders
          </h3>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-muted-foreground">
            Personal precision for builders who live in AI IDEs — catch vague UI
            language before it ships.
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
    </div>
  );
}
