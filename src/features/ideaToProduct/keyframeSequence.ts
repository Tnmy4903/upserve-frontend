import {
  getTransitionFrameUrls,
  KEYFRAME_TRANSITIONS,
} from "./keyframeManifest";

export type KeyframeEntry = {
  index: number;
  src: string;
  transitionId: string;
  transitionIndex: number;
  localFrameIndex: number;
};

export function buildKeyframeSequence(): KeyframeEntry[] {
  const sequence: KeyframeEntry[] = [];

  KEYFRAME_TRANSITIONS.forEach((transition, transitionIndex) => {
    getTransitionFrameUrls(transition).forEach((src, localFrameIndex) => {
      // Each transition starts at the previous transition's final anchor.
      if (sequence.at(-1)?.src === src) return;

      sequence.push({
        index: sequence.length,
        src,
        transitionId: transition.id,
        transitionIndex,
        localFrameIndex,
      });
    });
  });

  return sequence;
}

export function getSequenceFrame(
  sequence: KeyframeEntry[],
  progress: number,
): KeyframeEntry | undefined {
  if (!sequence.length) return undefined;
  const normalized = Math.min(1, Math.max(0, progress));
  return sequence[Math.round(normalized * (sequence.length - 1))];
}
