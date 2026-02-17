import React from "react";

function SocialComponent({ outerStyle, style, icon: Icon, url }: any) {
  return (
    <div style={outerStyle}>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <div style={style}>{Icon && <Icon />}</div>
      </a>
    </div>
  );
}

export default SocialComponent;