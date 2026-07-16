import type { ChangeEvent, DragEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { PercentCrop } from 'react-image-crop';
import { useImageConverter } from './useImageConverter.ts';

export function useImageConverterPage() {
  const navigate = useNavigate();
  const converter = useImageConverter();

  const handleDrag = (event: DragEvent<HTMLElement>): void => {
    event.preventDefault();
    event.stopPropagation();
    converter.setDragActive(event.type === 'dragenter' || event.type === 'dragover');
  };

  const handleDrop = (event: DragEvent<HTMLElement>): void => {
    event.preventDefault();
    event.stopPropagation();
    converter.setDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (file) converter.selectImage(file);
  };

  const handleFileInput = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) converter.selectImage(file);
    event.target.value = '';
  };

  return {
    ...converter,
    handleCropChange: (_crop: unknown, percentCrop: PercentCrop) => converter.changeCrop(percentCrop),
    handleCropComplete: (_crop: unknown, percentCrop: PercentCrop) => converter.completeCrop(percentCrop),
    handleDrag,
    handleDrop,
    handleFileInput,
    navigateBack: () => void navigate('/mail'),
  };
}

export type ImageConverterPageViewModel = ReturnType<typeof useImageConverterPage>;
