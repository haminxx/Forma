import * as RdxHoverCard from "@radix-ui/react-hover-card";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
} from "framer-motion";
import {
  type MouseEvent,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

/**
 * HoverPeek — Radix HoverCard wrapper that previews a link's screenshot via
 * Microlink (https://microlink.io). Adapted from the user-pasted snippet
 * with two surgical swaps: `qss` → built-in `URLSearchParams`, and the
 * `cn` import folded into a local helper. Lens magnifier + mouse-follow
 * card kept verbatim.
 *
 * Note: the unauthenticated Microlink endpoint is rate-limited (~50
 * requests/day per IP). For production traffic, sign up for a Microlink
 * key and prepend it to the request, or self-host a screenshot service.
 */

function cn(...args: Array<string | undefined | null | false>): string {
  return args.filter(Boolean).join(" ");
}

function buildMicrolinkSrc(
  url: string,
  width: number,
  height: number,
  isStatic: boolean,
  staticImageSrc?: string,
): string {
  if (isStatic) return staticImageSrc ?? "";
  const params = new URLSearchParams({
    url,
    screenshot: "true",
    meta: "false",
    embed: "screenshot.url",
    colorScheme: "dark",
    "viewport.isMobile": "true",
    "viewport.deviceScaleFactor": "1",
    "viewport.width": String(width * 2.5),
    "viewport.height": String(height * 2.5),
  });
  return `https://api.microlink.io/?${params.toString()}`;
}

function useHoverState(followMouse: boolean) {
  const [isPeeking, setPeeking] = useState(false);
  const mouseX = useMotionValue(0);
  const followX = useSpring(mouseX, { stiffness: 120, damping: 20 });

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (!followMouse) return;
      const rect = event.currentTarget.getBoundingClientRect();
      const offsetFromCenter =
        (event.clientX - rect.left - rect.width / 2) * 0.3;
      mouseX.set(offsetFromCenter);
    },
    [mouseX, followMouse],
  );

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setPeeking(open);
      if (!open) mouseX.set(0);
    },
    [mouseX],
  );

  return { isPeeking, handleOpenChange, handlePointerMove, followX };
}

type HoverPeekBase = {
  children: ReactNode;
  url: string;
  className?: string;
  peekWidth?: number;
  peekHeight?: number;
  enableMouseFollow?: boolean;
  enableLensEffect?: boolean;
  lensZoomFactor?: number;
  lensSize?: number;
};

type HoverPeekProps = HoverPeekBase &
  ({ isStatic: true; imageSrc: string } | { isStatic?: false; imageSrc?: never });

export function HoverPeek({
  children,
  url,
  className,
  peekWidth = 220,
  peekHeight = 138,
  isStatic = false,
  imageSrc = "",
  enableMouseFollow = true,
  enableLensEffect = true,
  lensZoomFactor = 1.75,
  lensSize = 100,
}: HoverPeekProps) {
  const [imageLoadFailed, setImageLoadFailed] = useState(false);
  const finalImageSrc = useMemo(
    () => buildMicrolinkSrc(url, peekWidth, peekHeight, isStatic, imageSrc),
    [url, peekWidth, peekHeight, isStatic, imageSrc],
  );

  const { isPeeking, handleOpenChange, handlePointerMove, followX } =
    useHoverState(enableMouseFollow);

  const [isHoveringLens, setIsHoveringLens] = useState(false);
  const [lensMousePosition, setLensMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setImageLoadFailed(false);
  }, [finalImageSrc]);

  useEffect(() => {
    if (!isPeeking) {
      setImageLoadFailed(false);
      setIsHoveringLens(false);
    }
  }, [isPeeking]);

  const handleLensMouseMove = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!enableLensEffect) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setLensMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };
  const handleLensMouseEnter = () => {
    if (enableLensEffect) setIsHoveringLens(true);
  };
  const handleLensMouseLeave = () => {
    if (enableLensEffect) setIsHoveringLens(false);
  };

  const cardMotionVariants = {
    initial: { opacity: 0, rotateY: -90 },
    animate: { opacity: 1, rotateY: 0 },
    exit: { opacity: 0, rotateY: 90 },
  } as const;

  const lensMotionVariants = {
    initial: { opacity: 0, scale: 0.7 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.7 },
  } as const;

  const triggerChild = isValidElement(children)
    ? cloneElement(children as ReactElement<{ className?: string; onPointerMove?: typeof handlePointerMove }>, {
        className: cn(
          (children.props as { className?: string }).className,
          className,
        ),
        onPointerMove: handlePointerMove,
      })
    : (
      <span className={className} onPointerMove={handlePointerMove}>
        {children}
      </span>
    );

  return (
    <RdxHoverCard.Root
      openDelay={75}
      closeDelay={150}
      onOpenChange={handleOpenChange}
    >
      <RdxHoverCard.Trigger asChild>{triggerChild}</RdxHoverCard.Trigger>

      <RdxHoverCard.Portal>
        <RdxHoverCard.Content
          className="z-50 [perspective:800px] [--radix-hover-card-content-transform-origin:center_center]"
          side="top"
          align="center"
          sideOffset={12}
          style={{ pointerEvents: enableLensEffect ? "none" : "auto" }}
        >
          <AnimatePresence>
            {isPeeking && (
              <motion.div
                variants={cardMotionVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ type: "spring", stiffness: 200, damping: 18 }}
                style={{
                  x: enableMouseFollow ? followX : 0,
                  pointerEvents: "auto",
                }}
              >
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "relative block overflow-hidden rounded-lg p-0.5",
                    "border border-neutral-700 bg-neutral-900",
                    "shadow-lg transition-shadow hover:shadow-xl",
                  )}
                  onMouseEnter={handleLensMouseEnter}
                  onMouseLeave={handleLensMouseLeave}
                  onMouseMove={handleLensMouseMove}
                >
                  {imageLoadFailed ? (
                    <div
                      className="flex items-center justify-center bg-neutral-800 font-sans text-xs text-neutral-400"
                      style={{ width: peekWidth, height: peekHeight }}
                    >
                      Preview unavailable
                    </div>
                  ) : (
                    <img
                      src={finalImageSrc}
                      width={peekWidth}
                      height={peekHeight}
                      className="pointer-events-none block rounded-[5px] bg-neutral-800 align-top"
                      alt={`Link preview for ${url}`}
                      onError={() => setImageLoadFailed(true)}
                      loading="lazy"
                    />
                  )}

                  <AnimatePresence>
                    {enableLensEffect && isHoveringLens && !imageLoadFailed && (
                      <motion.div
                        className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg"
                        variants={lensMotionVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        style={{
                          maskImage: `radial-gradient(circle ${lensSize / 2}px at ${lensMousePosition.x}px ${lensMousePosition.y}px, black ${lensSize / 2}px, transparent ${lensSize / 2}px)`,
                          WebkitMaskImage: `radial-gradient(circle ${lensSize / 2}px at ${lensMousePosition.x}px ${lensMousePosition.y}px, black ${lensSize / 2}px, transparent ${lensSize / 2}px)`,
                        }}
                      >
                        <div
                          className="absolute inset-0"
                          style={{
                            transform: `scale(${lensZoomFactor})`,
                            transformOrigin: `${lensMousePosition.x}px ${lensMousePosition.y}px`,
                          }}
                        >
                          <img
                            src={finalImageSrc}
                            width={peekWidth}
                            height={peekHeight}
                            className="block rounded-[5px] bg-neutral-800 align-top"
                            alt=""
                            aria-hidden="true"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </a>
              </motion.div>
            )}
          </AnimatePresence>
        </RdxHoverCard.Content>
      </RdxHoverCard.Portal>
    </RdxHoverCard.Root>
  );
}
