"use client";
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
  useEffect,
} from "react";

interface ScratchProviderInterface {
  screen: "desktop" | "mobile";
  setScreen: Dispatch<SetStateAction<"desktop" | "mobile">>;
  draggedElement: any;
  setDraggedElement: Dispatch<SetStateAction<any>>;
  combinedElements: any[];
  setCombinedElements: Dispatch<SetStateAction<any[]>>;
  selectedElement: any;
  setSelectedElement: Dispatch<SetStateAction<any>>;
}
const scratchContext = createContext<ScratchProviderInterface | undefined>(
  undefined
);

export function ScratchProvider({ children }: { children: React.ReactNode }) {
  const [screen, setScreen] = useState<"desktop" | "mobile">("desktop");
  const [draggedElement, setDraggedElement] = useState<any>();
  const [combinedElements, setCombinedElements] = useState<any[]>([]);
  const [selectedElement, setSelectedElement] = useState<any>();
  const [isLoaded, setIsLoaded] = useState(false);

  // useEffect(() => {
  //   const saved = localStorage.getItem("combinedElements");
  //   if (saved) {
  //     setCombinedElements(JSON.parse(saved));
  //   }
  //   setIsLoaded(true);
  // }, []);

  // useEffect(() => {
  //   if (isLoaded) {
  //     localStorage.setItem("combinedElements", JSON.stringify(combinedElements));
  //   }
  // }, [combinedElements, isLoaded]);

  // useEffect(() => {
  //   if (selectedElement) {
  //     setCombinedElements((prev) =>
  //       prev.map((el) => (el.id === selectedElement.id ? selectedElement : el))
  //     );
  //   }
  // }, [selectedElement]);

  return (
    <scratchContext.Provider
      value={{
        screen,
        setScreen,
        draggedElement,
        setDraggedElement,
        combinedElements,
        setCombinedElements,
        selectedElement,
        setSelectedElement,
      }}
    >
      {children}
    </scratchContext.Provider>
  );
}

export const useScreen = () => {
  const context = useContext(scratchContext);
  if (!context) {
    throw new Error("Provider not available");
  }
  const { screen, setScreen } = context;
  return [screen, setScreen];
};

export const useDragged = () => {
  const context = useContext(scratchContext);
  if (!context) {
    throw new Error("Provider not available");
  }
  const { draggedElement, setDraggedElement } = context;
  return [draggedElement, setDraggedElement];
};

export const useTemplates = () => {
  const context = useContext(scratchContext);
  if (!context) {
    throw new Error("Provider not available");
  }
  const { combinedElements, setCombinedElements } = context;
  return [combinedElements, setCombinedElements];
};

export const useSelectedElement = () => {
  const context = useContext(scratchContext);
  if (!context) {
    throw new Error("Provider not available");
  }
  const { selectedElement, setSelectedElement } = context;
  return [selectedElement, setSelectedElement];
};
