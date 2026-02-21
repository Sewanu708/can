"use client";
import "grapesjs/dist/css/grapes.min.css";
import "./canvas.css";
import grapesjs, { Editor } from "grapesjs";
import { useEffect, useState } from "react";
import {
  blocks,
  layouts,
  section,
  column,
  createPersonalizationDropdown,
} from "./config";
import { ChevronDown, Paintbrush, Sparkles } from "lucide-react";
import { AssetManagerModal } from "@/components/asset-manager-modal";
import { EditorAssistant } from "@/hooks/editor-assistant";

function Canvas() {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const [color, setColor] = useState("#000000");
  const [dropdown, setDropdown] = useState({
    layout: true,
    blocks: true,
  });
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">(
    "desktop",
  );

  // --- NEW STATE FOR RIGHT PANEL TABS ---
  const [activeRightTab, setActiveRightTab] = useState<"styles" | "ai">(
    "styles",
  );

  // --- NEW STATE FOR MODAL ---
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [assetTarget, setAssetTarget] = useState<any>(null);
  // ---------------------------

  const handleClick = (type: "layout" | "blocks") => {
    setDropdown((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const handleDeviceChange = (device: "desktop" | "tablet" | "mobile") => {
    setDevice(device);
  };

  const handleSave = () => {
    if (editor) {
      // Try to get inlined HTML (requires grapesjs-preset-newsletter or similar)
      const inlinedHtml = editor.runCommand("gjs-get-inlined-html");

      if (inlinedHtml) {
        console.log(inlinedHtml);
      } else {
        const html = editor.getHtml();
        const css = editor.getCss();
        console.log(`<style>${css}</style>${html}`);
      }
      alert("Saved! Check console for HTML.");
    }
  };

  // --- NEW HELPER FUNCTIONS ---
  const open_asset_manager = (target: any = null) => {
    setAssetTarget(target);
    setIsAssetModalOpen(true);
  };

  const close_asset_manager = () => {
    setIsAssetModalOpen(false);
    setAssetTarget(null);
  };

  const handle_asset_select = (asset: any) => {
    if (assetTarget) {
      // If a component was targeted (e.g., the image just dropped),
      // set its 'src' attribute to the URL of the selected asset.
      assetTarget.set("src", asset.src);
    } else {
      // If no component was targeted, add the asset to the gallery.
      // This happens when opening the manager from a button, for example.
      editor?.AssetManager.add(asset);
    }
    close_asset_manager();
  };
  // ----------------------------

  // --- EFFECT: HANDLE DEVICE SWITCHING ---
  useEffect(() => {
    if (!editor) return;

    const iframe = editor.Canvas.getFrameEl();
    const doc = iframe?.contentDocument;

    if (doc && doc.body) {
      doc.body.style.transition =
        "width 0.3s ease-in-out, margin 0.3s ease-in-out";

      if (device === "mobile") {
        doc.body.style.width = "375px";
        doc.body.style.margin = "0 auto";
      } else if (device === "tablet") {
        doc.body.style.width = "768px";
        doc.body.style.margin = "0 auto";
      } else {
        doc.body.style.width = "100%";
        doc.body.style.margin = "0";
      }
    }
  }, [editor, device]);

  useEffect(() => {
    const customBlockManager = (editor: any) => {
      editor.on("block:custom", ({ blocks, dragStart, dragStop }: any) => {
        const layoutContainer = document.getElementById("layouts");
        const blocksContainer = document.getElementById("blocks");

        if (layoutContainer) layoutContainer.innerHTML = "";
        if (blocksContainer) blocksContainer.innerHTML = "";

        blocks.forEach((block: any) => {
          const el = document.createElement("div");
          el.innerHTML = block.getMedia();
          const card = el.firstElementChild as HTMLElement;

          if (card) {
            card.addEventListener("mousedown", (e) => dragStart(block));
            card.addEventListener("mouseup", (e) => dragStop(block));

            const isLayout = layouts.some((l) => l.id === block.getId());
            if (isLayout && layoutContainer) {
              layoutContainer.appendChild(card);
            } else if (blocksContainer) {
              blocksContainer.appendChild(card);
            }
          }
        });
      });
    };

    const componentLoader = (editor: any) => {
      editor.DomComponents.addType("section", section);
      editor.DomComponents.addType("column", column);

      editor.on("load", () => {
        const style = document.createElement("style");
        style.innerHTML = `
          .column:empty {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 50px;
            background-color: #f9fafb;
            border: 2px dashed #e5e7eb;
            border-radius: 4px;
          }
          .column:empty::after {
            content: "Drop element here";
            color: #9ca3af;
            font-size: 0.875rem;
          }
        `;
        editor.Canvas.getBody().appendChild(style);
      });
    };

    const newEditor = grapesjs.init({
      container: "#gjs",
      plugins: [customBlockManager, componentLoader],
      blockManager: {
        custom: true,
        blocks: [...layouts, ...blocks],
      },

      styleManager: {
        appendTo: "#settings",
        sectors: [
          {
            name: "Layout",
            open: false,
            buildProps: [
              "display",
              "flex-direction",
              "flex-wrap",
              "justify-content",
              "align-items",
              "align-content",
              "order",
              "flex-basis",
              "flex-grow",
              "flex-shrink",
              "align-self",
            ],
          },
          {
            name: "Dimension",
            open: false,
            buildProps: ["width", "min-height", "padding", "margin"],
          },
          {
            name: "Typography",
            open: false,
            buildProps: [
              "font-family",
              "font-size",
              "font-weight",
              "letter-spacing",
              "color",
              "line-height",
              "text-align",
              "text-decoration",
              "text-shadow",
            ],
          },
          {
            name: "Decorations",
            open: false,
            buildProps: [
              "background-color",
              "border-radius",
              "border",
              "box-shadow",
              "background",
            ],
          },
          {
            name: "Extra",
            open: false,
            buildProps: ["opacity", "transition", "transform"],
          },
        ],
      },

      selectorManager: {
        appendTo: "#settings",
      },

      traitManager: {
        appendTo: "#settings",
      },

      // richTextEditor: {
      //   actions: [
      //     // GrapesJS default actions (e.g., bold, italic) can be added here if desired
      //     // For simplicity, we'll just add our custom button for now.
      //     "bold",
      //     "italic",
      //     "underline",
      //     "strikethrough",
      //     "|",
      //     "link",
      //     "|",
      //     // "personalization",
      //   ],
      // },
      // -----------------------------------

      // --- MODIFIED ASSET MANAGER CONFIG ---
      assetManager: {
        custom: true, // This is the key change!
        // We will add upload logic here later
      },
      // -------------------------------------

      // canvas: {
      //   styles: [
      //     `body { background-color: #f3f4f6; padding: 20px; margin: 0; }`,
      //   ],
      // },

      height: "100%",
      width: "100%",
      storageManager: false,

      panels: { defaults: [] },
      canvas: {
        styles: [
          `body {
             background-color: #f3f4f6;
             padding: 20px;
             margin: 0;
             transition: width 0.3s ease-in-out;
           }`,
        ],
      },
    });

    // --- NEW EVENT LISTENERS ---
    // Listen for the custom asset manager to be triggered
    newEditor.on("asset:custom", ({ container, open }) => {
      // The `open` function is what GrapesJS uses to launch the asset manager.
      // We will replace it with our own logic.
      // The `container` is where GrapesJS would normally render its UI, which we will ignore.
      open_asset_manager();
    });

    // Listen for a new component being added
    newEditor.on("component:add", (component) => {
      // If the new component is an image, open the asset manager
      if (component.get("type") === "image") {
        open_asset_manager(component);
      }
    });
    // ---------------------------

    setEditor(newEditor);

    // Cleanup
    return () => {
      newEditor.destroy();
    };
  }, []);

  useEffect(() => {
    if (editor) {
      const rte = editor.RichTextEditor;

      editor.Commands.add("insert-variable", {
        run(editor, sender, options) {
          const variable = options.variable;
          if (!variable) return;
          const rteInstance = rte.globalRte;
          if (!rteInstance) return;

          rteInstance.insertHTML(
            `<span class="personalization-token" contenteditable="false" data-variable="${variable}">${variable}</span>&nbsp;`,
          );
        },
      });
      const icon = `<svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>`;

      const createIconElement = () => {
        const div = document.createElement("div");
        div.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" style="width: 16px; height: 16px;">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
      </svg>`;
        return div.firstElementChild as HTMLElement;
      };
      rte.add("personalization", {
        icon: createIconElement(),

        attributes: {
          title: "Insert Personalization",
          command: "personalization-btn",
        },
        result: (rte, action) => {
          createPersonalizationDropdown(editor, rte);
        },
      });

      editor.on("load", () => {
        const iframe = editor.Canvas.getFrameEl(); // Get the iframe element that wraps the editable canvas
        const doc = iframe?.contentDocument; // Access the iframe's internal document so we can inject styles into it

        if (doc) {
          const style = doc.createElement("style"); // Create a new <style> element to hold our CSS
          style.textContent = `
        .personalization-token {
          background-color: #e3f2fd; /* Light blue background to make tokens stand out */
          color: #1976d2;            /* Blue text colour */
          padding: 2px 6px;          /* Small padding to give the token a pill-like look */
          border-radius: 3px;        /* Slightly rounded corners */
          font-family: monospace;    /* Monospace font to signal it's a code/variable */
          font-size: 0.9em;          /* Slightly smaller than surrounding text */
          border: 1px solid #90caf9; /* Soft blue border */
          cursor: pointer;           /* Show pointer cursor on hover */
          user-select: none;         /* Prevent the user from selecting/highlighting the token text */
        }
        
        .personalization-token:hover {
          background-color: #bbdefb; /* Slightly darker blue on hover for interactivity feedback */
        }
      `;
          doc.head.appendChild(style);
        }
      });

      // --- AI ASSISTANT TOOLBAR INTEGRATION ---
      editor.Commands.add("tlb-ai-edit", {
        run(editor, sender) {
          setActiveRightTab("ai");
          editor.stopCommand("tlb-ai-edit");
        },
      });

      editor.on("component:selected", (component) => {
        const toolbar = component.get("toolbar");
        const aiCommand = "tlb-ai-edit";

        if (toolbar && toolbar.some((t: any) => t.command === aiCommand)) {
          return;
        }

        const sparkleIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M9 3v4"/><path d="M3 5h4"/><path d="M3 9h4"/></svg>`;

        const aiButton = {
          command: aiCommand,
          label: sparkleIcon,
          attributes: { title: "Edit with AI" },
        };

        const defaultToolbar = [
          { attributes: { class: "fa fa-arrows" }, command: "tlb-move" },
          { attributes: { class: "fa fa-clone" }, command: "tlb-clone" },
          { attributes: { class: "fa fa-trash-o" }, command: "tlb-delete" },
        ];

        const currentToolbar = Array.isArray(toolbar)
          ? toolbar
          : defaultToolbar;
        component.set("toolbar", [aiButton, ...currentToolbar]);
      });
      // ----------------------------------------
    }
  }, [editor]);

  return (
    <div className="editor-container flex flex-col h-screen w-full">
      {/* --- ADD THE MODAL TO THE JSX --- */}
      <AssetManagerModal
        open={isAssetModalOpen}
        onClose={close_asset_manager}
        onSelect={handle_asset_select}
      />
      {/* ---------------------------------- */}

      {/* Top Toolbar */}
      <div className="panel__top flex items-center justify-between px-4 py-2">
        {/* LEFT — Logo placeholder */}
        <div className="flex items-center gap-2 w-48">
          <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">✦</span>
          </div>
          <span className="text-sm font-semibold text-gray-700 tracking-tight">
            MyEditor
          </span>
        </div>

        {/* CENTER — Device toggles */}
        <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${device === "desktop" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            onClick={() => handleDeviceChange("desktop")}
          >
            Desktop
          </button>
          <button
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${device === "tablet" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            onClick={() => handleDeviceChange("tablet")}
          >
            Tablet
          </button>
          <button
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${device === "mobile" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            onClick={() => handleDeviceChange("mobile")}
          >
            Mobile
          </button>
        </div>

        {/* RIGHT — Save button */}
        <div className="flex items-center justify-end w-48">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
      {/* Main Editor Row */}
      <div className="editor-row flex flex-1 overflow-hidden">
        {/* LEFT — Block Manager */}
        <div className="panel__left w-72 border-r border-gray-200 overflow-y-auto flex-shrink-0 bg-white">
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
            <div
              id="layouts"
              className="flex flex-col gap-4 mb-6"
              style={{ display: dropdown.layout ? "flex" : "none" }}
            ></div>

            <div
              className="flex items-center justify-between mb-4 cursor-pointer"
              onClick={() => handleClick("blocks")}
            >
              <div className="text-sm font-medium text-gray-700">Blocks</div>
              <button
                type="button"
                className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                aria-label="Toggle layout"
              >
                <ChevronDown size={16} className="text-gray-500" />
              </button>
            </div>
            <div
              id="blocks"
              className="grid grid-cols-2 gap-4"
              style={{ display: dropdown.blocks ? "grid" : "none" }}
            ></div>
          </div>
        </div>

        {/* MIDDLE — Canvas */}
        <div className="editor-canvas flex-1 bg-gray-50 overflow-hidden relative">
          <div id="gjs" className="h-full w-full"></div>
        </div>

        {/* RIGHT — Settings */}
        <div className="panel__right w-80 border-l border-gray-200 flex flex-col bg-white">
          {/* Right Panel Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeRightTab === "styles" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => setActiveRightTab("styles")}
            >
              <Paintbrush size={16} /> Styles
            </button>
            <button
              className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeRightTab === "ai" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => setActiveRightTab("ai")}
            >
              <Sparkles size={16} /> AI Assistant
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden relative">
            <div
              id="settings"
              className={`h-full overflow-y-auto ${activeRightTab === "styles" ? "block" : "hidden"}`}
            ></div>

            {activeRightTab === "ai" && <EditorAssistant editor={editor} />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Canvas;
