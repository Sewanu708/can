'use client'
import { Button } from "@/components/ui/button";
import { useScreen } from "@/providers/scratch";
import { Code, Monitor, Redo, Smartphone, Undo } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
function EditorHeader() {
  const [screen, setScreen] = useScreen() as [
    "desktop" | "mobile",
    Dispatch<SetStateAction<"desktop" | "mobile">>
  ];
  return (
    <div className="p-4 shadow-sm flex  items-center justify-between">
      <div>
        {/* <Image src={"./vercel.svg"} alt="logo" width={40} height={40} /> */}
        <svg
          width="32"
          height="32"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#15803d" />
              <stop offset="100%" stopColor="#022c22" />
            </linearGradient>
          </defs>
          <polygon points="50,10 90,90 10,90" fill="url(#gradient)" />
        </svg>
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={() => setScreen("desktop")}
          variant={screen === "desktop" ? "default" : "secondary"}
        >
          <Monitor />
          <span>Desktop</span>
        </Button>

        <Button
          onClick={() => setScreen("mobile")}
          variant={screen === "mobile" ? "default" : "secondary"}
        >
          <Smartphone />
          <span>Smartphone</span>
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 border-r-[1.5px] border-[#fafafa]">
          <Button>
            <Undo />
          </Button>
          <Button>
            <Redo />
          </Button>
        </div>
        <Button>
          <Code />
        </Button>

        <Button>Save Template</Button>
      </div>
    </div>
  );
}

export default EditorHeader;
