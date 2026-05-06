import { ArrowUp, Paperclip, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/Card";

/**
 * Per-platform visual identity. We don't ship logos here; instead each card
 * shows a stylized prompt-box mock that evokes the platform's own input UI
 * (background tone, accent color, button label, placeholder copy). This keeps
 * the asset pipeline empty while still communicating "Forma drops in here."
 */
export type PlatformId = "v0" | "lovable" | "replit" | "bolt" | "manus";

type PlatformConfig = {
  name: string;
  tagline: string;
  /** Inner prompt-mock background. */
  surface: string;
  /** Border tone for the inner prompt-mock. */
  border: string;
  /** Accent color used on the send button + tag. */
  accent: string;
  /** Foreground color for the send button glyph. */
  accentFg: string;
  /** Sample placeholder text in the mock prompt. */
  placeholder: string;
  /** Short send-button label rendered next to the arrow. */
  sendLabel: string;
};

const PLATFORMS: Record<PlatformId, PlatformConfig> = {
  v0: {
    name: "Vercel v0",
    tagline: "Generate UI from a prompt.",
    surface: "#0a0a0a",
    border: "#1f1f1f",
    accent: "#ffffff",
    accentFg: "#0a0a0a",
    placeholder: "Ask v0 to build…",
    sendLabel: "Generate",
  },
  lovable: {
    name: "Lovable",
    tagline: "Idea to app in seconds.",
    surface: "#150f1d",
    border: "#2a1f3d",
    accent: "#c084fc",
    accentFg: "#1a0f25",
    placeholder: "What do you want to build?",
    sendLabel: "Build",
  },
  replit: {
    name: "Replit",
    tagline: "Cloud IDE with Agent.",
    surface: "#0e1525",
    border: "#1c2333",
    accent: "#f26207",
    accentFg: "#0e1525",
    placeholder: "Describe an app for the Agent…",
    sendLabel: "Run",
  },
  bolt: {
    name: "Bolt",
    tagline: "Prompt, run, deploy full-stack.",
    surface: "#0c1116",
    border: "#1c252e",
    accent: "#22d3ee",
    accentFg: "#062029",
    placeholder: "What should we build today?",
    sendLabel: "Ship",
  },
  manus: {
    name: "Manus",
    tagline: "An autonomous agent for tasks.",
    surface: "#0d1014",
    border: "#1a1f25",
    accent: "#a3b4c6",
    accentFg: "#0d1014",
    placeholder: "Give Manus a goal…",
    sendLabel: "Send",
  },
};

type PlatformCardProps = {
  platform: PlatformId;
};

export function PlatformCard({ platform }: PlatformCardProps) {
  const config = PLATFORMS[platform];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-2 p-5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[15px]">{config.name}</CardTitle>
          <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-forma-border)] bg-[var(--color-forma-card-2)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-forma-gold)]">
            <Sparkles className="h-3 w-3" strokeWidth={1.8} />
            Forma-ready
          </span>
        </div>
        <CardDescription className="text-[12px] leading-relaxed">
          {config.tagline}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-5 pt-0">
        <PlatformPromptMock config={config} />
      </CardContent>
    </Card>
  );
}

/**
 * Stylized prompt-input mock — same shape as the real PromptDemoBox but
 * recolored to match each target platform. Strictly decorative.
 */
function PlatformPromptMock({ config }: { config: PlatformConfig }) {
  return (
    <div
      className="rounded-2xl border px-3 pt-2.5 pb-2"
      style={{ backgroundColor: config.surface, borderColor: config.border }}
    >
      <div className="px-1 py-1 text-[12px]" style={{ color: "#9aa3b1" }}>
        {config.placeholder}
      </div>

      <div className="flex items-center justify-between pt-2">
        <div
          className="flex h-6 w-6 items-center justify-center rounded-full"
          style={{ color: "#9aa3b1" }}
        >
          <Paperclip className="h-3.5 w-3.5" />
        </div>

        <div
          className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium"
          style={{ backgroundColor: config.accent, color: config.accentFg }}
        >
          <span>{config.sendLabel}</span>
          <ArrowUp className="h-3 w-3" strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );
}
