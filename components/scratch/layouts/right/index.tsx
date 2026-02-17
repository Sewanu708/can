"use client";
import { useSelectedElement, useTemplates } from "@/providers/scratch";
import React, { Dispatch, SetStateAction } from "react";
import Properties from "./properties";

function RightLayout() {
  const [selectedElement] = useSelectedElement();
  const [combinedElements, setCombinedElements] = useTemplates() as [
    any[],
    Dispatch<SetStateAction<any[]>>
  ];

  // Derive the active element directly from combinedElements to ensure reactivity
  const activeElement = selectedElement
    ? combinedElements.find((el) => el.id === selectedElement.layout.id)?.[
        selectedElement.index
      ]
    : null;

  const handleUpdate = (key: string, value: any) => {
    if (!selectedElement) return;

    setCombinedElements((prev) =>
      prev.map((el) => {
        if (el.id === selectedElement.layout.id) {
          return {
            ...el,
            [selectedElement.index]: {
              ...el[selectedElement.index],
              [key]: value,
            },
          };
        }
        return el;
      })
    );
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 border-b font-semibold">Settings</div>
      <Properties element={activeElement} handleChange={handleUpdate} />
    </div>
  );
}

export default RightLayout;
