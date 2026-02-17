import {
  BrickWall,
  Facebook,
  Image,
  Instagram,
  Linkedin,
  RectangleHorizontal,
  SquareSplitVertical,
  Text,
  Twitter,
} from "lucide-react";

export const ColumnBlocks = [
  {
    label: "1 Column",
    type: "column",
    span: 1,
    icon: RectangleHorizontal,
    style: {},
    outerStyle: {},
    url: "",
    content: "",
  },
  {
    label: "2 Columns",
    type: "column",
    span: 2,
    icon: RectangleHorizontal,
    style: {},
    outerStyle: {},
    url: "",
    content: "",
  },
  {
    label: "3 Columns",
    type: "column",
    span: 3,
    icon: RectangleHorizontal,
    style: {},
    outerStyle: {},
    url: "",
    content: "",
  },
  {
    label: "4 Columns",
    type: "column",
    span: 4,
    icon: RectangleHorizontal,
    style: {},
    outerStyle: {},
    url: "",
    content: "",
  },
];

type BlockStyle = {
  padding?: string;
  margin?: string;
  backgroundColor?: string;
  color?: string;
  fontSize?: string;
  fontWeight?: string | number;
  textAlign?: "left" | "center" | "right";
  borderRadius?: string;
  border?: string;
  width?: string;
  height?: string;
  display?: string;
  alignItems?: string;
  justifyContent?: string;
  cursor?: string;
  lineHeight?: string | number;
};

const defaultOuterStyle: BlockStyle = {
  padding: "8px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const defaultTextStyle: BlockStyle = {
  color: "#111827",
  fontSize: "14px",
  lineHeight: 1.4,
  textAlign: "left",
  fontWeight: "normal",
};

export const ContentBlocks = [
  {
    label: "Images",
    type: "image",
    icon: Image,
    style: {
      width: "100%",
      height: "auto",
      borderRadius: "6px",
      display: "block",
    } as BlockStyle,
    outerStyle: {
      ...defaultOuterStyle,
      padding: "6px",
    } as BlockStyle,
    url: "",
    content: "",
  },
  {
    label: "Text",
    type: "text",
    // span: 3,
    icon: Text,
    style: {
      ...defaultTextStyle,
      padding: "4px 0",
      width: "100%",
    } as BlockStyle,
    outerStyle: {
      ...defaultOuterStyle,
      justifyContent: "flex-start",
      width: "100%",
    } as BlockStyle,
    url: "",
    content: "Sample text",
  },
  {
    label: "Button",
    type: "button",
    // span: 4,
    icon: BrickWall,
    style: {
      backgroundColor: "#2563eb",
      color: "#fff",
      padding: "8px 12px",
      borderRadius: "6px",
      border: "none",
      cursor: "pointer",
      fontWeight: 600,
      display: "inline-block",
    } as BlockStyle,
    outerStyle: {
      ...defaultOuterStyle,
    } as BlockStyle,
    url: "",
    content: "Click",
  },
  {
    label: "Button",
    type: "button",
    // span: 4,
    icon: SquareSplitVertical,
    style: {
      backgroundColor: "transparent",
      color: "#2563eb",
      padding: "8px 12px",
      borderRadius: "6px",
      border: "1px solid #2563eb",
      cursor: "pointer",
      fontWeight: 600,
      display: "inline-block",
    } as BlockStyle,
    outerStyle: {
      ...defaultOuterStyle,
    } as BlockStyle,
    url: "",
    content: "Click",
  },
];

export const SocialBlocks = [
  {
    label: "Facebook",
    type: "social",
    icon: Facebook,
    style: {},
    outerStyle: {},
    url: "https://facebook.com",
    content: "",
  },
  {
    label: "Twitter",
    type: "social",
    icon: Twitter,
    style: {},
    outerStyle: {},
    url: "https://twitter.com",
    content: "",
  },
  {
    label: "Instagram",
    type: "social",
    icon: Instagram,
    style: {},
    outerStyle: {},
    url: "https://instagram.com",
    content: "",
  },
  {
    label: "LinkedIn",
    type: "social",
    icon: Linkedin,
    style: {},
    outerStyle: {},
    url: "https://linkedin.com",
    content: "",
  },
];
