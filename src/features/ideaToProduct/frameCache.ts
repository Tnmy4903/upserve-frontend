export class KeyframeCache {
  private readonly images = new Map<string, Promise<HTMLImageElement>>();

  load(src: string): Promise<HTMLImageElement> {
    const cached = this.images.get(src);
    if (cached) return cached;

    const image = new Image();
    const request = new Promise<HTMLImageElement>((resolve, reject) => {
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`Unable to load keyframe: ${src}`));
    });

    image.decoding = "async";
    image.src = src;
    this.images.set(src, request);
    return request;
  }

  preload(sources: string[], centerIndex: number, radius = 1) {
    const start = Math.max(0, centerIndex - radius);
    const end = Math.min(sources.length, centerIndex + radius + 1);
    return Promise.allSettled(
      sources.slice(start, end).map((source) => this.load(source)),
    );
  }

  clear() {
    this.images.clear();
  }
}
