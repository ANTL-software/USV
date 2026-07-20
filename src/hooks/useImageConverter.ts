import { useCallback, useEffect, useState } from 'react';
import type { Crop, PercentCrop } from 'react-image-crop';
import { convertImageToPdfService } from '../API/services/index.ts';
import {
  DEFAULT_IMAGE_CROP,
  DEFAULT_IMAGE_PERCENT_CROP,
  IMAGE_ASPECT_RATIOS,
  IMAGE_MAX_SIZE_MB,
} from '../utils/scripts/index.ts';
import type { ImageAspectRatio } from '../utils/scripts/index.ts';
import { logError } from '../utils/scripts/index.ts';
import { showError, triggerBlobDownload } from '../utils/services/index.ts';
import type { IConvertCropData } from '../utils/types/index.ts';

export function useImageConverter() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [imageLoadFailed, setImageLoadFailed] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [customFileName, setCustomFileName] = useState('');
  const [crop, setCrop] = useState<Crop>(DEFAULT_IMAGE_CROP);
  const [completedCrop, setCompletedCrop] = useState<PercentCrop>(DEFAULT_IMAGE_PERCENT_CROP);
  const [aspectRatio, setAspectRatio] = useState<ImageAspectRatio>('libre');

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const selectImage = useCallback((file: File): void => {
    if (file.size > IMAGE_MAX_SIZE_MB * 1024 * 1024) {
      void showError(`L'image est trop lourde (max ${IMAGE_MAX_SIZE_MB}MB)`);
      return;
    }

    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }

    const previewUrl = URL.createObjectURL(file);
    const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, '').trim();

    setImageFile(file);
    setImagePreviewUrl(previewUrl);
    setImageLoadFailed(false);
    setCrop(DEFAULT_IMAGE_CROP);
    setCompletedCrop(DEFAULT_IMAGE_PERCENT_CROP);
    setCustomFileName(nameWithoutExtension);
    setStep(2);
  }, [imagePreviewUrl]);

  const markImageLoadFailed = useCallback((): void => {
    setImageLoadFailed(true);
    setCompletedCrop({ unit: '%', x: 0, y: 0, width: 100, height: 100 });
  }, []);

  const changeAspectRatio = useCallback((ratio: ImageAspectRatio): void => {
    setAspectRatio(ratio);
    setCrop((previous) => ({ ...previous, aspect: IMAGE_ASPECT_RATIOS[ratio] }));
  }, []);

  const changeCrop = useCallback((percentCrop: PercentCrop): void => {
    setCrop(percentCrop);
  }, []);

  const completeCrop = useCallback((percentCrop: PercentCrop): void => {
    if (percentCrop.width > 0 && percentCrop.height > 0) {
      setCompletedCrop(percentCrop);
    }
  }, []);

  const convert = useCallback(async (): Promise<void> => {
    if (!imageFile || !customFileName.trim()) {
      return;
    }

    setIsConverting(true);
    try {
      const cropData: IConvertCropData = {
        x: completedCrop.x,
        y: completedCrop.y,
        width: completedCrop.width || 100,
        height: completedCrop.height || 100,
      };
      const fileName = customFileName.trim();
      const blob = await convertImageToPdfService(imageFile, cropData, fileName);
      triggerBlobDownload(blob, `${fileName}.pdf`);
      setStep(4);
    } catch (conversionError) {
      logError('convertImageToPdf', conversionError);
      await showError('Erreur lors de la conversion. Veuillez réessayer.');
    } finally {
      setIsConverting(false);
    }
  }, [completedCrop, customFileName, imageFile]);

  const reset = useCallback((): void => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }

    setImageFile(null);
    setImagePreviewUrl('');
    setImageLoadFailed(false);
    setCustomFileName('');
    setCrop(DEFAULT_IMAGE_CROP);
    setCompletedCrop(DEFAULT_IMAGE_PERCENT_CROP);
    setAspectRatio('libre');
    setStep(1);
  }, [imagePreviewUrl]);

  return {
    aspectRatio,
    changeAspectRatio,
    changeCrop,
    completeCrop,
    convert,
    crop,
    customFileName,
    dragActive,
    imageLoadFailed,
    imagePreviewUrl,
    isConverting,
    markImageLoadFailed,
    reset,
    selectImage,
    setCustomFileName,
    setDragActive,
    setStep,
    step,
  };
}
