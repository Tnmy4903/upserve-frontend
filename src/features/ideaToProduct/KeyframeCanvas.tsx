import { useEffect, useRef } from "react";
import { KeyframeCache } from "./frameCache";
import type { KeyframeEntry } from "./keyframeSequence";

type KeyframeCanvasProps = {
  frame?: KeyframeEntry;
  cache?: KeyframeCache;
  className?: string;
  ariaLabel?: string;
};

const BACKGROUND = "#101014";

export function KeyframeCanvas({
  frame,
  cache,
  className,
  ariaLabel = "Upserve process visual",
}: KeyframeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cacheRef = useRef<KeyframeCache | null>(null);
  const imageRef = useRef<HTMLImageElement | undefined>(undefined);
  const requestRef = useRef(0);

  if (!cacheRef.current) cacheRef.current = cache ?? new KeyframeCache();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let frameRequest = 0;
    let disposed = false;
    const requestId = ++requestRef.current;

    const draw = () => {
      if (disposed) return;
      const rect = canvas.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(rect.width * pixelRatio));
      const height = Math.max(1, Math.round(rect.height * pixelRatio));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.fillStyle = BACKGROUND;
      context.fillRect(0, 0, rect.width, rect.height);

      const image = imageRef.current;
      if (!image) return;

      const scale = Math.min(rect.width / image.naturalWidth, rect.height / image.naturalHeight);
      const drawWidth = image.naturalWidth * scale;
      const drawHeight = image.naturalHeight * scale;
      context.drawImage(
        image,
        (rect.width - drawWidth) / 2,
        (rect.height - drawHeight) / 2,
        drawWidth,
        drawHeight,
      );
    };

    const resizeObserver = new ResizeObserver(() => {
      cancelAnimationFrame(frameRequest);
      frameRequest = requestAnimationFrame(draw);
    });
    resizeObserver.observe(canvas);

    if (frame) {
      cacheRef.current
        ?.load(frame.src)
        .then((loadedImage) => {
          // Scrolling can request several frames before an image resolves.
          // Only the latest request may replace the currently displayed frame.
          if (!disposed && requestRef.current === requestId) {
            imageRef.current = loadedImage;
            draw();
          }
        })
        .catch(() => {
          if (!disposed) draw();
        });
    } else {
      imageRef.current = undefined;
      draw();
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(frameRequest);
      resizeObserver.disconnect();
    };
  }, [frame]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      role="img"
      aria-label={ariaLabel}
    />
  );
}
