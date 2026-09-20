export const KEYFRAME_TRANSITIONS = [
  { id: "0-1", frameCount: 4 },
  { id: "1-2", frameCount: 2 },
  { id: "2-3", frameCount: 3 },
  { id: "3-4", frameCount: 4 },
  { id: "4-5", frameCount: 2 },
  { id: "5-6", frameCount: 3 },
  { id: "6-7", frameCount: 2 },
  { id: "7-8", frameCount: 3 },
  { id: "8-9", frameCount: 1 },
] as const;

export type KeyframeTransition = (typeof KEYFRAME_TRANSITIONS)[number];

export function getTransitionFrameUrls(transition: KeyframeTransition) {
  return Array.from(
    { length: transition.frameCount },
    (_, frameIndex) => `/keyframes/${transition.id}/${frameIndex}.png`,
  );
}
