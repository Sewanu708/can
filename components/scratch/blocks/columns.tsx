"use client";
import {
  useDragged,
  useSelectedElement,
  useTemplates,
} from "@/providers/scratch";
import React, {
  Dispatch,
  DragEvent,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { number } from "zod";
import TextComponent from "./elements/text";
import ButtonComponent from "./elements/button";
import ImageComponent from "./elements/image";
import SocialComponent from "./elements/social";

function ColumnBlock({
  layout,
}: {
  layout: {
    id: string | number;
    label: string;
    type: string;
    span: number;
    index?: number;
    icon?: ReactNode;
  };
}) {
  const [dragOver, setDragOver] = useState<{
    index: string | number;
    col_id: string | number;
  } | null>(null);
  const [draggedElement] = useDragged();
  const [combinedElements, setCombinedElements] = useTemplates() as [
    any[],
    Dispatch<SetStateAction<any[]>>
  ];
  const [selectedElement, setSelectedElement] = useSelectedElement();

  const handleDragOver = (
    e: DragEvent<HTMLDivElement>,
    index: number | string
  ) => {
    e.preventDefault();
    console.log("first");
    if (draggedElement.id) {
      setDragOver({
        index: index,
        col_id: layout.id,
      });
      return;
    }
    setDragOver(null);
  };
  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(null);
  };
  const handleDrop = (e: DragEvent, index: string | number) => {
    e.preventDefault();
    setDragOver(null);
    console.log("last");

    setCombinedElements((prev) =>
      prev.map((element) => {
        console.log("check,", element.id === layout.id);
        return element.id === layout.id
          ? { ...element, [index]: { ...draggedElement } }
          : element;
      })
    );
  };

  const getComponentElement = (component: any) => {
    const handleTextChange = (index: number | string) => {};
    if (component.type == "text") {
      return <TextComponent {...component} />;
    }
    if (component.type == "button") {
      return <ButtonComponent {...component} />;
    }
    if (component.type == "image") {
      return <ImageComponent {...component} />;
    }
    if (component.type == "social") {
      return <SocialComponent {...component} />;
    }
    return (
      <div className="w-full p-3 bg-white rounded shadow-sm border border-gray-200 text-center">
        <span className="font-medium text-gray-700 text-sm">
          {component.label || component.type}
        </span>
      </div>
    );
  };

  useEffect(() => {
    console.log("Logging");
    console.log(layout);
    console.log(combinedElements);
  }, [combinedElements]);

  return (
    <div className="w-full">
      <div
        className="gap-4"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${layout.span}, 1fr)`,
        }}
      >
        {Array.from({ length: layout.span }).map((_, index) => {
          const isDragOver = dragOver?.index === index;
          // && dragOver?.col_id === layout.id;
          console.log(selectedElement);
          return (
            <div
              key={index}
              className={`flex items-center justify-center p-4 border-2 border-dashed rounded-lg min-h-[100px]  ${
                selectedElement?.layout.id == layout.id &&
                selectedElement?.index == index
                  ? "bg-red-800"
                  : ""
              } transition-all duration-200 ${
                isDragOver
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-gray-50 text-gray-400"
              }`}
              onDrop={(e) => handleDrop(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onClick={() => setSelectedElement({ layout, index })}
            >
              {(layout as any)[index] ? (
                getComponentElement((layout as any)[index])
              ) : (
                <span className="text-sm pointer-events-none">
                  {isDragOver ? "Drop Here" : "Empty Column"}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ColumnBlock;
