import { useEffect, useRef, useState } from "react";

const clamp = (value: number) => Math.min(1, Math.max(0, value));

export function useScrollProgress(
  elementRef: React.RefObject<HTMLElement | null>,
) {
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);
  const activeRef = useRef(false);
  const lockedScrollYRef = useRef(0);
  const touchYRef = useRef<number | null>(null);

  useEffect(() => {
    const setDocumentScrollLock = (locked: boolean) => {
      document.documentElement.style.overflow = locked ? "hidden" : "";
      document.body.style.overflow = locked ? "hidden" : "";
    };

    const updateProgress = (deltaY: number) => {
      const step = Math.max(0.0075, Math.min(0.045, Math.abs(deltaY) / 2000));
      const next = clamp(progressRef.current + (deltaY > 0 ? step : -step));
      progressRef.current = next;
      setProgress(next);
    };

    const handleDelta = (deltaY: number, preventDefault: () => void) => {
      const element = elementRef.current;
      if (!element) return;
      const track = element.closest<HTMLElement>(".about-video") ?? element;
      const rect = track.getBoundingClientRect();
      const pinTop = Math.min(window.innerHeight * 0.1, 86);
      const pinTolerance = 48;
      const sectionIsNearEntry =
        rect.top >= pinTop - pinTolerance &&
        rect.top <= pinTop + pinTolerance &&
        rect.bottom > pinTop;
      const nextTopAfterWheel = rect.top - deltaY;
      const crossesEntryForward =
        deltaY > 0 && rect.top > pinTop && nextTopAfterWheel <= pinTop;
      const crossesEntryReverse =
        deltaY < 0 && rect.top < pinTop && nextTopAfterWheel >= pinTop;

      if (!activeRef.current) {
        const entering =
          deltaY > 0 &&
          progressRef.current < 1 &&
          (sectionIsNearEntry || crossesEntryForward);
        const reversing =
          deltaY < 0 &&
          progressRef.current > 0 &&
          (sectionIsNearEntry || crossesEntryReverse);
        if (!entering && !reversing) return;
        activeRef.current = true;
        lockedScrollYRef.current = Math.max(
          0,
          Math.round(window.scrollY + rect.top - pinTop),
        );
        setDocumentScrollLock(true);
        window.scrollTo(0, lockedScrollYRef.current);
      }

      const movingForward = deltaY > 0;
      const canMove = movingForward
        ? progressRef.current < 1
        : progressRef.current > 0;

      if (!canMove) {
        activeRef.current = false;
        setDocumentScrollLock(false);
        return;
      }

      preventDefault();
      updateProgress(deltaY);
    };

    const handleWheel = (event: WheelEvent) => {
      handleDelta(event.deltaY, () => event.preventDefault());
    };

    const handleTouchStart = (event: TouchEvent) => {
      touchYRef.current = event.touches[0]?.clientY ?? null;
    };

    const handleTouchMove = (event: TouchEvent) => {
      const currentY = event.touches[0]?.clientY;
      const previousY = touchYRef.current;
      if (
        currentY === undefined ||
        previousY === null ||
        previousY === undefined
      ) {
        touchYRef.current = currentY ?? null;
        return;
      }

      const deltaY = previousY - currentY;
      touchYRef.current = currentY;
      if (deltaY !== 0) {
        handleDelta(deltaY, () => event.preventDefault());
      }
    };

    const holdDocumentPosition = () => {
      if (activeRef.current && window.scrollY !== lockedScrollYRef.current) {
        window.scrollTo(0, lockedScrollYRef.current);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("scroll", holdDocumentPosition, { passive: true });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("scroll", holdDocumentPosition);
      setDocumentScrollLock(false);
    };
  }, [elementRef]);

  return progress;
}
