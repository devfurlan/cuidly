'use client';

import Cropper, { Area } from 'react-easy-crop';
import { useCallback, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/shadcn/dialog';
import { Button } from '@/components/ui/shadcn/button';
import { Slider } from '@/components/ui/shadcn/slider';
import { PiArrowClockwise, PiArrowCounterClockwise, PiCircleNotch } from 'react-icons/pi';

interface ImageCropDialogProps {
  image: string;
  isOpen: boolean;
  onClose: () => void;
  onCrop: (croppedImage: string) => void;
  aspectRatio?: number;
  cropShape?: 'rect' | 'round';
  title?: string;
}

export function ImageCropDialog({
  image,
  isOpen,
  onClose,
  onCrop,
  aspectRatio = 1,
  cropShape = 'round',
  title = 'Ajustar foto',
}: ImageCropDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropComplete = useCallback((_croppedArea: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleCrop = async () => {
    if (!croppedAreaPixels) return;

    setIsProcessing(true);
    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels, rotation);
      onCrop(croppedImage);
      onClose();
    } catch (error) {
      console.error('Error cropping image:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const rotateLeft = () => {
    setRotation((prev) => prev - 90);
  };

  const rotateRight = () => {
    setRotation((prev) => prev + 90);
  };

  const handleClose = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCroppedAreaPixels(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="relative h-[300px] w-full overflow-hidden rounded-lg bg-black">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspectRatio}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropComplete}
            cropShape={cropShape}
            showGrid={false}
          />
        </div>

        <div className="space-y-4">
          {/* Rotation controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={rotateLeft}
              disabled={isProcessing}
            >
              <PiArrowCounterClockwise className="mr-1 size-4" />
              Girar
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={rotateRight}
              disabled={isProcessing}
            >
              Girar
              <PiArrowClockwise className="ml-1 size-4" />
            </Button>
          </div>

          {/* Zoom control */}
          <div className="space-y-2">
            <p className="text-center text-sm text-gray-500">Zoom</p>
            <Slider
              min={1}
              max={3}
              step={0.1}
              value={[zoom]}
              onValueChange={([val]) => setZoom(val)}
              className="mx-auto max-w-56"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
            Cancelar
          </Button>
          <Button onClick={handleCrop} disabled={isProcessing}>
            {isProcessing ? (
              <>
                <PiCircleNotch className="mr-2 size-4 animate-spin" />
                Processando...
              </>
            ) : (
              'Usar foto'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });
}

function getRadianAngle(degreeValue: number): number {
  return (degreeValue * Math.PI) / 180;
}

/**
 * Returns the new bounding area of a rotated rectangle.
 */
function rotateSize(
  width: number,
  height: number,
  rotation: number,
): { width: number; height: number } {
  const rotRad = getRadianAngle(rotation);

  return {
    width:
      Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0,
): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  const rotRad = getRadianAngle(rotation);

  // Calculate bounding box of the rotated image
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.width,
    image.height,
    rotation,
  );

  // Set canvas size to match the bounding box
  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  // Translate canvas context to a central location to allow rotating and flipping around the center
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.width / 2, -image.height / 2);

  // Draw rotated image
  ctx.drawImage(image, 0, 0);

  // croppedAreaPixels values are bounding box relative
  // Extract the cropped image using these values
  const data = ctx.getImageData(
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
  );

  // Set canvas width to final desired crop size - this will clear existing context
  const outputSize = 400;
  canvas.width = outputSize;
  canvas.height = outputSize;

  // Enable high quality image scaling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Create a temporary canvas to hold the cropped data
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = pixelCrop.width;
  tempCanvas.height = pixelCrop.height;
  const tempCtx = tempCanvas.getContext('2d')!;
  tempCtx.putImageData(data, 0, 0);

  // Draw the cropped image scaled to output size
  ctx.drawImage(
    tempCanvas,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputSize,
    outputSize,
  );

  return canvas.toDataURL('image/jpeg', 0.9);
}
