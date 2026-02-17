'use  client'
import React from "react";
import EditorHeader from "@/components/scratch/header";
import LeftLayout from "@/components/scratch/layouts/left";
import RightLayout from "@/components/scratch/layouts/right";
import Canvas from "@/components/scratch/layouts/canvas";

function Editor() {
  return (
    <div className="h-screen flex flex-col">
      <EditorHeader />
      <div className="grid grid-cols-5 flex-1 overflow-hidden">
        <div className="col-span-1 overflow-y-auto  border-r border-r-gray-200">
          <LeftLayout />
        </div>

        <div className="col-span-3 bg-gray-100 overflow-y-auto relative">
          <Canvas />
        </div>

        <div className="col-span-1 overflow-y-auto border-l border-l-gray-200">
          <RightLayout />
        </div>
      </div>
    </div>
  );
}

export default Editor;
