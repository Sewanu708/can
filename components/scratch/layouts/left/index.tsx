"use client";
import { useState } from "react";
import { ColumnBlocks, ContentBlocks, SocialBlocks } from "./contants";
import { ArrowDown, ChevronDown, DotSquare, GripVertical } from "lucide-react";
import { useDragged } from "@/providers/scratch";

function LeftLayout() {
  const [_, setDraggedElement] = useDragged();
  const [dropdown, setDropdown] = useState({
    layout: true,
    content: false,
  });

  const handleClick = (type: "layout" | "content") => {
    setDropdown((prev) => ({
      layout: false,
      content: false,
      [type]: !prev[type],
    }));
  };

  const handleDragStart = (block: any) => {
    console.log(block);
    if (block.type == "column") {
      setDraggedElement({ ...block, id: Date.now() });
      return;
    }   
    setDraggedElement({ ...block });
  };
  return (
    <div className="p-4 ">
      <div className="cursor-pointer mb-4">
        <div
          className="flex   items-center justify-between mb-4"
          onClick={() => handleClick("layout")}
        >
          <div className="text-sm font-medium text-gray-700">Layout</div>
          <button
            type="button"
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Toggle layout"
          >
            <ChevronDown size={16} className="text-gray-500" />
          </button>
        </div>

        {dropdown.layout && (
          <div className="grid grid-cols-2 gap-3">
            {ColumnBlocks.map((block: any, index: number) => (
              <div
                key={index}
                draggable
                className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-200 cursor-grab hover:shadow-md hover:border-blue-500 hover:border-dashed bg-white transition-all select-none"
                onDragStart={() => handleDragStart(block)}
              >
                <div className="flex-1 flex flex-col gap-2 items-center justify-center w-full">
                  <div className="flex items-center gap-2 w-full">
                    <div className="flex gap-1 h-8 w-full">
                      {Array.from({ length: block.span }).map((_, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-gray-200 rounded-sm border border-gray-300"
                        />
                      ))}
                    </div>
                  </div>

                  <div className="text-sm text-center font-medium text-gray-700">
                    {block.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="cursor-pointer mb-4">
        <div
          className="flex   items-center justify-between mb-4"
          onClick={() => handleClick("content")}
        >
          <div className="text-sm font-medium text-gray-700">Content</div>
          <button
            type="button"
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Toggle layout"
          >
            <ChevronDown size={16} className="text-gray-500" />
          </button>
        </div>
        {dropdown.content && (
          <div className="grid grid-cols-2 gap-3">
            {[...ContentBlocks, ...SocialBlocks].map(
              (block: any, index: number) => (
                <div
                  key={index}
                  draggable
                  className="flex flex-col items-center justify-center gap-3 p-4 rounded-lg border  hover:border-dashed border-gray-200 cursor-grab hover:shadow-md hover:border-blue-500 bg-white transition-all group select-none"
                  onDragStart={() => handleDragStart(block)}
                >
                  <div className="p-2 bg-gray-50 rounded-md group-hover:bg-blue-50 transition-colors">
                    <block.icon
                      size={24}
                      className="text-gray-600 group-hover:text-blue-600"
                    />
                  </div>
                  <div className="text-xs font-medium text-gray-600 group-hover:text-gray-900">
                    {block.label}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default LeftLayout;
