import { Textarea } from "@/components/ui/textarea";
import React from "react";

function TextComponent({ content, outerStyle, style, handleChange }: any) {
  return (
    <div style={outerStyle}>
      <Textarea
        value={content}
        style={style}
        onInput={(event) => handleChange(event.currentTarget.value)}
      />
    </div>
  );
}

export default TextComponent;
