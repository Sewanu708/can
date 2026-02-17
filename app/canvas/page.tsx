"use client";
// import "grapesjs/dist/css/grapes.min.css";
import "./canvas.css";
import grapesjs from "grapesjs";
import { useEffect, useState } from "react";
import { blocks } from "./config";
import { ChevronDown } from "lucide-react";

function Canvas() {
  // 1. The "Remote Control"
  // We keep a reference to the editor so we can tell it what to do later.
  const [editor, setEditor] = useState<any>(null);
  const [selectedElement, setSelectedElement] = useState<any>(null);
  // NEW: State to keep track of the current color
  const [color, setColor] = useState("#000000");
  const [dropdown, setDropdown] = useState({
    layout: true,
  });
  const handleClick = (type: "layout") => {
    setDropdown((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  useEffect(() => {
    const newEditor = grapesjs.init({
      container: "#gjs",

      blockManager: {
        appendTo: "#blocks",
        blocks,
      },

      // styleManager: {
      //   appendTo: "#settings",
      // },

      // traitManager: {
      //   appendTo: "#settings",
      // },

      height: "100vh",
      width: "100%",
      storageManager: false,

      panels: { defaults: [] },
    });

    setEditor(newEditor);

    // Cleanup
    return () => {
      newEditor.destroy();
    };
  }, []);

  return (
    <div className="editor-container">
      {/* Top Toolbar */}
      <div className="panel__top">
        <div className="panel__basic-actions">{/* Your Custom Toolbar */}</div>
      </div>

      {/* Main Editor Row */}
      <div className="editor-row">
        {/* LEFT — Block Manager */}
        <div className="panel__left">
          <div className="p-4">
            <div
              className="flex items-center justify-between mb-4 cursor-pointer"
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
            <div id="blocks" style={{ display: dropdown.layout ? "block" : "none" }}></div>
          </div>
        </div>

        {/* MIDDLE — Canvas */}
        <div className="editor-canvas">
          <div id="gjs"></div>
        </div>

        {/* RIGHT — Settings */}
        <div className="panel__right">
          <div id="settings"></div>
        </div>
      </div>
    </div>
  );
}

export default Canvas;
