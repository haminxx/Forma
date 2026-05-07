import { useState } from "react";
import { Github, Instagram, Linkedin, Twitter } from "lucide-react";
import { cn } from "../../lib/cn";

/**
 * Team showcase — staggered photo grid on the left + member name list
 * on the right with hover-driven dim/highlight cross-talk. Adapted from
 * the user-pasted `team-showcase` snippet but:
 *   - swapped `react-icons/fa` for `lucide-react` (already installed)
 *   - swapped the `cn` import path to Forma's local helper
 *   - empty-state defaults so the section renders cleanly before any
 *     team data is filled in (the user asked for empty cards "for now")
 */

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  image?: string;
  social?: {
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    github?: string;
  };
}

const PLACEHOLDER_MEMBERS: TeamMember[] = [
  { id: "1", name: "—", role: "Coming soon" },
  { id: "2", name: "—", role: "Coming soon" },
  { id: "3", name: "—", role: "Coming soon" },
  { id: "4", name: "—", role: "Coming soon" },
  { id: "5", name: "—", role: "Coming soon" },
  { id: "6", name: "—", role: "Coming soon" },
];

interface TeamShowcaseProps {
  members?: TeamMember[];
}

export default function TeamShowcase({ members = PLACEHOLDER_MEMBERS }: TeamShowcaseProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const col1 = members.filter((_, i) => i % 3 === 0);
  const col2 = members.filter((_, i) => i % 3 === 1);
  const col3 = members.filter((_, i) => i % 3 === 2);

  return (
    <div className="mx-auto flex w-full max-w-5xl select-none flex-col items-start gap-8 px-4 py-8 font-sans md:flex-row md:gap-10 md:px-6 lg:gap-14">
      {/* ── Left: photo grid ── */}
      <div className="flex flex-shrink-0 gap-2 overflow-x-auto pb-1 md:gap-3 md:pb-0">
        {/* Column 1 */}
        <div className="flex flex-col gap-2 md:gap-3">
          {col1.map((member) => (
            <PhotoCard
              key={member.id}
              member={member}
              className="h-[120px] w-[110px] sm:h-[140px] sm:w-[130px] md:h-[165px] md:w-[155px]"
              hoveredId={hoveredId}
              onHover={setHoveredId}
            />
          ))}
        </div>

        {/* Column 2 */}
        <div className="mt-[48px] flex flex-col gap-2 sm:mt-[56px] md:mt-[68px] md:gap-3">
          {col2.map((member) => (
            <PhotoCard
              key={member.id}
              member={member}
              className="h-[132px] w-[122px] sm:h-[155px] sm:w-[145px] md:h-[182px] md:w-[172px]"
              hoveredId={hoveredId}
              onHover={setHoveredId}
            />
          ))}
        </div>

        {/* Column 3 */}
        <div className="mt-[22px] flex flex-col gap-2 sm:mt-[26px] md:mt-[32px] md:gap-3">
          {col3.map((member) => (
            <PhotoCard
              key={member.id}
              member={member}
              className="h-[125px] w-[115px] sm:h-[146px] sm:w-[136px] md:h-[172px] md:w-[162px]"
              hoveredId={hoveredId}
              onHover={setHoveredId}
            />
          ))}
        </div>
      </div>

      {/* ── Right: member name list ── */}
      <div className="flex w-full flex-1 flex-col gap-4 pt-0 sm:grid sm:grid-cols-2 md:flex md:flex-col md:gap-5 md:pt-2">
        {members.map((member) => (
          <MemberRow
            key={member.id}
            member={member}
            hoveredId={hoveredId}
            onHover={setHoveredId}
          />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Photo card
───────────────────────────────────────── */

function PhotoCard({
  member,
  className,
  hoveredId,
  onHover,
}: {
  member: TeamMember;
  className: string;
  hoveredId: string | null;
  onHover: (id: string | null) => void;
}) {
  const isActive = hoveredId === member.id;
  const isDimmed = hoveredId !== null && !isActive;

  return (
    <div
      className={cn(
        "duration-400 flex-shrink-0 cursor-pointer overflow-hidden rounded-xl transition-opacity",
        className,
        isDimmed ? "opacity-60" : "opacity-100",
      )}
      onMouseEnter={() => onHover(member.id)}
      onMouseLeave={() => onHover(null)}
    >
      {member.image ? (
        <img
          src={member.image}
          alt={member.name}
          className="h-full w-full object-cover transition-[filter] duration-500"
          style={{
            filter: isActive
              ? "grayscale(0) brightness(1)"
              : "grayscale(1) brightness(0.77)",
          }}
        />
      ) : (
        // Placeholder fill for empty member slots — neutral gradient with
        // a faint inner ring so the card still has visual weight.
        <div
          aria-hidden="true"
          className="h-full w-full transition-all duration-500"
          style={{
            background: isActive
              ? "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 50%, rgba(212,184,122,0.18) 100%)"
              : "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 50%, rgba(255,255,255,0.04) 100%)",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
          }}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   Member name section
───────────────────────────────────────── */

function MemberRow({
  member,
  hoveredId,
  onHover,
}: {
  member: TeamMember;
  hoveredId: string | null;
  onHover: (id: string | null) => void;
}) {
  const isActive = hoveredId === member.id;
  const isDimmed = hoveredId !== null && !isActive;
  const hasSocial =
    member.social?.twitter ??
    member.social?.linkedin ??
    member.social?.instagram ??
    member.social?.github;

  return (
    <div
      className={cn(
        "cursor-pointer transition-opacity duration-300",
        isDimmed ? "opacity-50" : "opacity-100",
      )}
      onMouseEnter={() => onHover(member.id)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            "h-3 w-4 flex-shrink-0 rounded-[5px] transition-all duration-300",
            isActive ? "w-5 bg-white" : "bg-white/25",
          )}
        />
        <span
          className={cn(
            "text-base font-semibold leading-none tracking-tight transition-colors duration-300 md:text-[18px]",
            isActive ? "text-white" : "text-white/80",
          )}
        >
          {member.name}
        </span>

        {hasSocial && (
          <div
            className={cn(
              "ml-0.5 flex items-center gap-1.5 transition-all duration-200",
              isActive
                ? "translate-x-0 opacity-100"
                : "pointer-events-none -translate-x-2 opacity-0",
            )}
          >
            {member.social?.twitter && (
              <SocialLink href={member.social.twitter} label="X / Twitter">
                <Twitter size={10} strokeWidth={2} />
              </SocialLink>
            )}
            {member.social?.linkedin && (
              <SocialLink href={member.social.linkedin} label="LinkedIn">
                <Linkedin size={10} strokeWidth={2} />
              </SocialLink>
            )}
            {member.social?.instagram && (
              <SocialLink href={member.social.instagram} label="Instagram">
                <Instagram size={10} strokeWidth={2} />
              </SocialLink>
            )}
            {member.social?.github && (
              <SocialLink href={member.social.github} label="GitHub">
                <Github size={10} strokeWidth={2} />
              </SocialLink>
            )}
          </div>
        )}
      </div>

      <p className="mt-1.5 pl-[27px] text-[7px] font-medium uppercase tracking-[0.2em] text-white/45 md:text-[10px]">
        {member.role}
      </p>
    </div>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      title={label}
      aria-label={label}
      className="rounded p-1 text-white/55 transition-all duration-150 hover:scale-110 hover:bg-white/10 hover:text-white"
    >
      {children}
    </a>
  );
}

export { TeamShowcase };
