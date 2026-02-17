import { Textarea } from "@/components/ui/textarea";
import React from "react";

function Properties({ element, handleChange }: any) {
  if (!element)
    return (
      <div className="p-4 text-sm text-gray-500">
        Select an element to edit properties
      </div>
    );

  const handleStyleChange = (key: string, value: string) => {
    handleChange("style", { ...element.style, [key]: value });
  };

  return (
    <div className="space-y-6 p-4">
      {/* Content Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">Content</h3>

        {element.content !== undefined && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-700">Text</label>
            <Textarea
              value={element.content}
              onChange={(e) => handleChange("content", e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>
        )}

        {element.url !== undefined && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-700">URL</label>
            <input
              type="text"
              value={element.url}
              onChange={(e) => handleChange("url", e.target.value)}
              className="flex h-9 w-full rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950"
            />
          </div>
        )}
      </div>

      {/* Styles Section */}
      {element.style && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">Styles</h3>

          {/* Typography */}
          <div className="grid grid-cols-2 gap-4">
            {element.style.textAlign !== undefined && (
              <div className="space-y-1.5 col-span-2">
                <label className="text-xs font-medium text-gray-700">
                  Alignment
                </label>
                <select
                  value={element.style.textAlign}
                  onChange={(e) =>
                    handleStyleChange("textAlign", e.target.value)
                  }
                  className="flex h-8 w-full rounded-md border border-gray-200 bg-transparent px-3 text-sm shadow-sm"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
            )}
            {element.style.fontWeight !== undefined && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">
                  Weight
                </label>
                <select
                  value={element.style.fontWeight}
                  onChange={(e) =>
                    handleStyleChange("fontWeight", e.target.value)
                  }
                  className="flex h-8 w-full rounded-md border border-gray-200 bg-transparent px-3 text-sm shadow-sm"
                >
                  <option value="400">Normal</option>
                  <option value="500">Medium</option>
                  <option value="600">Semi Bold</option>
                  <option value="700">Bold</option>
                </select>
              </div>
            )}
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 gap-4">
            {element.style.backgroundColor !== undefined && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">
                  Background
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={element.style.backgroundColor}
                    onChange={(e) =>
                      handleStyleChange("backgroundColor", e.target.value)
                    }
                    className="h-8 w-8 rounded border border-gray-200 p-0.5 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {element.style.color !== undefined && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">
                  Text Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={element.style.color}
                    onChange={(e) => handleStyleChange("color", e.target.value)}
                    className="h-8 w-8 rounded border border-gray-200 p-0.5 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Dimensions & Spacing */}
          <div className="grid grid-cols-2 gap-4">
            {element.style.width !== undefined && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">
                  Width
                </label>
                <input
                  type="text"
                  value={element.style.width}
                  onChange={(e) => handleStyleChange("width", e.target.value)}
                  className="flex h-8 w-full rounded-md border border-gray-200 bg-transparent px-3 text-sm shadow-sm"
                />
              </div>
            )}
            {element.style.fontSize !== undefined && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">
                  Font Size
                </label>
                <input
                  type="text"
                  value={element.style.fontSize}
                  onChange={(e) =>
                    handleStyleChange("fontSize", e.target.value)
                  }
                  className="flex h-8 w-full rounded-md border border-gray-200 bg-transparent px-3 text-sm shadow-sm"
                />
              </div>
            )}
            {element.style.padding !== undefined && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">
                  Padding
                </label>
                <input
                  type="text"
                  value={element.style.padding}
                  onChange={(e) => handleStyleChange("padding", e.target.value)}
                  className="flex h-8 w-full rounded-md border border-gray-200 bg-transparent px-3 text-sm shadow-sm"
                />
              </div>
            )}
            {element.style.margin !== undefined && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">
                  Margin
                </label>
                <input
                  type="text"
                  value={element.style.margin}
                  onChange={(e) => handleStyleChange("margin", e.target.value)}
                  className="flex h-8 w-full rounded-md border border-gray-200 bg-transparent px-3 text-sm shadow-sm"
                />
              </div>
            )}
          </div>

          {/* Borders */}
          <div className="grid grid-cols-2 gap-4">
            {element.style.borderRadius !== undefined && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">
                  Radius
                </label>
                <input
                  type="text"
                  value={element.style.borderRadius}
                  onChange={(e) =>
                    handleStyleChange("borderRadius", e.target.value)
                  }
                  className="flex h-8 w-full rounded-md border border-gray-200 bg-transparent px-3 text-sm shadow-sm"
                />
              </div>
            )}
            {element.style.border !== undefined && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">
                  Border
                </label>
                <input
                  type="text"
                  value={element.style.border}
                  onChange={(e) => handleStyleChange("border", e.target.value)}
                  className="flex h-8 w-full rounded-md border border-gray-200 bg-transparent px-3 text-sm shadow-sm"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Properties;