"use client";
import { useDragged, useScreen, useTemplates } from "@/providers/scratch";
import { useState } from "react";
import type { Dispatch, SetStateAction, DragEvent } from "react";
import ColumnBlock from "../../blocks/columns";

function Canvas() {
  const [screen, _] = useScreen();
  const [draggedElement] = useDragged();
  const [combinedElements, setCombinedElements] = useTemplates() as [
    any[],
    Dispatch<SetStateAction<any[]>>
  ];
  const [dragOver, setDragOver] = useState(false);
  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    // console.log("drag over", draggedElement);
    if (draggedElement.id) {
      setDragOver(true);
      return;
    }
    setDragOver(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (draggedElement.id) {
      setCombinedElements((prev) => [...prev, draggedElement]);
    }
  };

  const getElementDetails = (layout: {
    id: string;
    label: string;
    type: string;
    span: number;
  }) => {
    // console.log(layout, "canvas");
    if (layout.type == "column") {
      return <ColumnBlock layout={layout} />;
    }
  };
  return (  
    <div className="flex items-center justify-center min-h-full p-8 bg-gray-50/50">
      <div
        className={`${
          dragOver
            ? "bg-blue-50 border-blue-400 border-2 border-dashed scale-[1.01]"
            : "bg-white border-gray-200 border"
        } transition-all duration-200 ease-in-out shadow-xl rounded-xl flex flex-col ${
          screen === "desktop" ? "w-full min-h-[80vh]" : "w-[375px] h-[667px]"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {combinedElements.length > 0 ? (
          <div className="p-6 space-y-4 w-full">
            {combinedElements.map((element, index) => {
              return (
                <div
                  key={index}
                  className="p-4 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow group"
                >
                  {/* <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-700 text-sm uppercase tracking-wider">
                      Element {index + 1}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 font-mono bg-gray-50 p-2 rounded border border-gray-200/50 break-all">
                    {typeof element === "object"
                      ? JSON.stringify(element)
                      : element !== undefined
                      ? String(element)
                      : ""}
                  </div> */}

                  {getElementDetails(element)}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-4 text-center">
            <div className="w-16 h-16 mb-4 rounded-full bg-gray-50 flex items-center justify-center border-2 border-dashed border-gray-200">
              <svg
                className="w-8 h-8 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <h2 className="text-lg font-medium text-gray-600">Canvas Empty</h2>
            <p className="text-sm text-gray-400 mt-1 max-w-xs">
              Drag and drop elements from the sidebar to start building your
              layout.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Canvas;
