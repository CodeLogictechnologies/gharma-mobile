export type ImageMeasurement = {
  x: number;
  y: number;
  width: number;
  height: number;
  uri: string;
};

let _pending: ImageMeasurement | null = null;

export const sharedTransitionStore = {
  set(m: ImageMeasurement) {
    _pending = m;
  },
  get(): ImageMeasurement | null {
    return _pending;
  },
  clear() {
    _pending = null;
  },
};
