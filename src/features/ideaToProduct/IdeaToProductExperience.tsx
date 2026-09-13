import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { IdeaToProductProps } from "./types";
import { KeyframeCanvas } from "./KeyframeCanvas";
import { buildKeyframeSequence, getSequenceFrame } from "./keyframeSequence";
import { useScrollProgress } from "./useScrollProgress";
import { KeyframeCache } from "./frameCache";
import { useReducedMotion } from "./useReducedMotion";
import "./ideaToProduct.css";

const initialSequence = buildKeyframeSequence();
const sequenceSources = initialSequence.map((entry) => entry.src);
const STAGES = [
  "Discovery",
  "Scope",
  "Agreement",
  "Design & Development",
  "Testing & QA",
  "Deployment & Handover",
  "Launch Support",
  "Final",
] as const;

/**
 * Isolated mount boundary for the future From Idea to Product experience.
 * Rendering is intentionally inert until the later roadmap phases begin.
 */
export function IdeaToProductExperience({ className }: IdeaToProductProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const featureRef = useRef<HTMLDivElement>(null);
  const cacheRef = useRef(new KeyframeCache());
  const [pinStyle, setPinStyle] = useState<React.CSSProperties>();
  const progress = useScrollProgress(trackRef);
  const reducedMotion = useReducedMotion();
  const effectiveProgress = reducedMotion ? 1 : progress;
  const frame = getSequenceFrame(initialSequence, effectiveProgress);
  const stageIndex = Math.min(STAGES.length - 1, Math.floor(effectiveProgress * STAGES.length));
  const isFinal = stageIndex === STAGES.length - 1 && effectiveProgress >= 0.96;
  // Release the two-column pin as soon as the final state is reached. The
  // final frame remains in normal flow, so the following sections never pass
  // underneath the canvas or heading.
  const isPinned = progress > 0 && progress < 1 && !isFinal;

  useLayoutEffect(() => {
    const updatePin = () => {
      const track = trackRef.current;
      const section = track?.closest<HTMLElement>(".about-video");
      const heading = section?.querySelector<HTMLElement>(".about-video__heading");

      if (!isPinned) {
        setPinStyle(undefined);
        if (heading) {
          heading.style.position = "";
          heading.style.top = "";
          heading.style.left = "";
          heading.style.width = "";
          heading.style.zIndex = "";
        }
        return;
      }

      if (!track) return;
      const rect = track.getBoundingClientRect();
      const isMobile = window.matchMedia("(max-width: 760px)").matches;
      const pinTop = Math.min(112, Math.max(80, window.innerHeight * 0.1));
      const headingRect = heading?.getBoundingClientRect();
      const canvasTop = isMobile
        ? pinTop + (headingRect?.height ?? 0) + 16
        : undefined;
      setPinStyle({
        position: "fixed",
        top: canvasTop ? `${canvasTop}px` : "clamp(5rem, 10vh, 7rem)",
        left: rect.left,
        width: rect.width,
        zIndex: 2,
      });

      if (heading) {
        heading.style.position = "fixed";
        heading.style.top = isMobile
          ? `${pinTop}px`
          : "clamp(5rem, 10vh, 7rem)";
        heading.style.left = `${headingRect?.left ?? 0}px`;
        heading.style.width = `${headingRect?.width ?? 0}px`;
        heading.style.zIndex = "2";
      }
    };

    updatePin();
    window.addEventListener("resize", updatePin);
    return () => window.removeEventListener("resize", updatePin);
  }, [isPinned]);


  useEffect(() => {
    // There are only a few small transition frames. Loading the complete
    // sequence once prevents a fast scroll from jumping over unloaded phases.
    void cacheRef.current.preload(sequenceSources, 0, sequenceSources.length);
  }, []);

  useEffect(() => {
    if (frame) void cacheRef.current.preload(sequenceSources, frame.index, 2);
  }, [frame]);

  return (
    <div
      ref={trackRef}
      className={`idea-to-product-track${isPinned ? " is-pinned" : ""}`}
      data-idea-to-product="shell"
      data-scroll-progress={progress.toFixed(3)}
    >
      <div
        ref={featureRef}
        className={`idea-to-product-feature${isPinned ? " is-pinned" : ""}`}
        style={pinStyle}
      >
        <div className="idea-to-product-pin">
          <KeyframeCanvas
            className={className ?? "idea-to-product-canvas"}
            frame={frame}
            cache={cacheRef.current}
            ariaLabel="Upserve process visual"
          />
          <div className="idea-to-product-stage" aria-live="polite">
            <span className="idea-to-product-stage__number">
              {String(stageIndex + 1).padStart(2, "0")}
            </span>
            {isFinal ? (
              <p>From idea to product. Upserve. Build Digital Products That Scale.</p>
            ) : (
              <p>{STAGES[stageIndex]}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
