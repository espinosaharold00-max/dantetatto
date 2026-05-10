"use client";

import { useState, useRef, useCallback } from "react";
import ReactCrop, { type Crop, type PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, Crop as CropIcon, Loader2 } from "lucide-react";

interface ImageCropperProps {
  aspectRatio?: number;
  onUploadComplete: (url: string) => void;
  label?: string;
  currentImage?: string;
}

function getCroppedCanvas(
  image: HTMLImageElement,
  crop: PixelCrop
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  canvas.width = crop.width * scaleX;
  canvas.height = crop.height * scaleY;

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return canvas;
}

export function ImageCropper({
  aspectRatio = 3 / 4,
  onUploadComplete,
  label = "Subir imagen",
  currentImage,
}: ImageCropperProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [uploading, setUploading] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setDialogOpen(true);
      setCrop(undefined);
      setCompletedCrop(undefined);
    };
    reader.readAsDataURL(file);
    if (fileRef.current) fileRef.current.value = "";
  };

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;

      let cropWidth = width;
      let cropHeight = width / aspectRatio;

      if (cropHeight > height) {
        cropHeight = height;
        cropWidth = height * aspectRatio;
      }

      cropWidth = Math.min(cropWidth, width);
      cropHeight = Math.min(cropHeight, height);

      const x = (width - cropWidth) / 2;
      const y = (height - cropHeight) / 2;

      const newCrop: Crop = {
        unit: "px",
        x,
        y,
        width: cropWidth,
        height: cropHeight,
      };

      setCrop(newCrop);
      setCompletedCrop({
        ...newCrop,
        unit: "px",
      });
    },
    [aspectRatio]
  );

  const handleCropAndUpload = async () => {
    if (!imgRef.current || !completedCrop) return;

    setUploading(true);
    try {
      const canvas = getCroppedCanvas(imgRef.current, completedCrop);

      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.92)
      );

      const fd = new FormData();
      fd.append("file", blob, "cropped.jpeg");

      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (res.ok) {
        const { url } = await res.json();
        onUploadComplete(url);
        setDialogOpen(false);
        setImageSrc(null);
      } else {
        const err = await res.json();
        alert(err.error || "Error al subir la imagen");
      }
    } catch (err) {
      console.error(err);
      alert("Error al procesar la imagen");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-4">
        {currentImage && (
          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-neutral-700">
            <img
              src={currentImage}
              alt="Preview"
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed border-neutral-700 px-4 py-3 text-neutral-400 transition-colors hover:border-brand-amber hover:text-brand-amber">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileSelect}
          />
          <Upload className="h-4 w-4" />
          <span className="text-sm">{label}</span>
        </label>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="dark max-h-[95vh] max-w-2xl overflow-y-auto border-neutral-800 bg-neutral-900">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <CropIcon className="h-5 w-5 text-brand-amber" />
              Recortar imagen
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-neutral-400">
            Ajusta el recorte para mantener una proporción uniforme.
          </p>

          {imageSrc && (
            <div className="mt-2 flex justify-center">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspectRatio}
                className="max-h-[60vh]"
              >
                <img
                  ref={imgRef}
                  src={imageSrc}
                  alt="Recortar"
                  onLoad={onImageLoad}
                  style={{ maxHeight: "60vh" }}
                />
              </ReactCrop>
            </div>
          )}

          <div className="mt-4 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                setImageSrc(null);
              }}
              className="border-neutral-700"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCropAndUpload}
              disabled={!completedCrop || uploading}
              className="gap-2 bg-brand-amber text-brand-dark hover:bg-brand-amber-dark"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CropIcon className="h-4 w-4" />
              )}
              {uploading ? "Subiendo..." : "Recortar y subir"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
