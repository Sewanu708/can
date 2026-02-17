import React from "react";

function ButtonComponent({ content, outerStyle, style }: any) {
  return (
    <div style={outerStyle}>
      <button style={style}>{content}</button>
    </div>
  );
}

export default ButtonComponent;
