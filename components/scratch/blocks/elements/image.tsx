import React from "react";

function ImageComponent({ outerStyle, style, url, content }: any) {
  return (
    <div style={outerStyle}>
      {url ? (
        <img src={url} alt={content} style={style} />
      ) : (
        <div
          style={{
            width: "100%",
            height: "200px",
            backgroundColor: "#f3f4f6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#9ca3af",
            ...style,
          }}
        >
          No Image
        </div>
      )}
    </div>
  );
}

export default ImageComponent;