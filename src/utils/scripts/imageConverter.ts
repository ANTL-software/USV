import type { Crop, PercentCrop } from 'react-image-crop';

export type ImageAspectRatio = 'libre' | 'carre' | '4-3' | 'a4';

export const IMAGE_ASPECT_RATIOS: Record<ImageAspectRatio, number | undefined> = {
  libre: undefined,
  carre: 1,
  '4-3': 4 / 3,
  a4: 210 / 297,
};

export const IMAGE_ACCEPTED_TYPES = '.jpg,.jpeg,.png,.webp,.heic,.heif';
export const IMAGE_MAX_SIZE_MB = 100;
export const DEFAULT_IMAGE_CROP: Crop = {
  unit: '%',
  x: 5,
  y: 5,
  width: 90,
  height: 90,
};
export const DEFAULT_IMAGE_PERCENT_CROP: PercentCrop = {
  unit: '%',
  x: 5,
  y: 5,
  width: 90,
  height: 90,
};
