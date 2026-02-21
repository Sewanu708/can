// components/asset-manager-modal.tsx

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadButton } from "@/lib/uploadthing";
import { useState, useEffect } from "react";

interface AssetManagerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (asset: { src: string }) => void;
}

export function AssetManagerModal({
  open,
  onClose,
  onSelect,
}: AssetManagerModalProps) {
  const [assets, setAssets] = useState<{ url: string; key: string }[]>([]);

  // Read from local storage when the modal opens
  useEffect(() => {
    if (open) {
      const storedAssets = localStorage.getItem("my-assets");
      if (storedAssets) {
        setAssets(JSON.parse(storedAssets));
      }
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[70vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Asset Manager</DialogTitle>
          <DialogDescription>
            Select an existing asset or upload a new one.
          </DialogDescription>
        </DialogHeader>
        <Tabs
          defaultValue="upload"
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsList>
            <TabsTrigger value="upload">Upload New</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
          </TabsList>
          <TabsContent
            value="upload"
            className="flex-1 flex flex-col p-4 items-center justify-center"
          >
            <UploadButton
              endpoint="imageUploader"
              onClientUploadComplete={(res) => {
                if (res && res.length > 0) {
                  const uploadedFile = res[0];
                  const newAsset = {
                    name: uploadedFile.name,
                    url: uploadedFile.url,
                    key: uploadedFile.key,
                    // base64:uploadedFile.base64
                  };

                  // Add to local storage
                  const storedAssets = localStorage.getItem("my-assets");
                  const existingAssets = storedAssets
                    ? JSON.parse(storedAssets)
                    : [];
                  const updatedAssets = [newAsset, ...existingAssets]; // Prepend new asset
                  localStorage.setItem(
                    "my-assets",
                    JSON.stringify(updatedAssets),
                  );

                  // Update component state to reflect the new asset immediately
                  setAssets(updatedAssets);

                  // Update GrapesJS
                  onSelect({ src: newAsset.url });
                  onClose();
                  alert("Upload Completed");
                }
              }}
              onUploadError={(error: Error) => {
                alert(`ERROR! ${error.message}`);
                console.error(error);
              }}
            />
          </TabsContent>
          <TabsContent value="gallery" className="flex-1 overflow-y-auto p-4">
            {assets.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No assets found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {assets.map((asset) => (
                  <div
                    key={asset.key}
                    className="relative aspect-square group cursor-pointer"
                    onClick={() => {
                      onSelect({ src: asset.url });
                      onClose();
                    }}
                  >
                    <img
                      src={asset.url}
                      alt={`Uploaded asset ${asset.key}`}
                      className="object-cover w-full h-full rounded-md"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                      <p className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-xs p-1 text-center">
                        Select
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
