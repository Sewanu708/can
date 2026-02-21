import { Editor } from "grapesjs";

const columnPreview = (span: number, label: string) => `
  <div class="group flex flex-col items-center gap-3 p-3 w-full rounded-lg border border-gray-200 bg-white cursor-grab transition-all hover:shadow-md hover:border-blue-500 hover:border-dashed select-none">
    <div class="flex w-full gap-1 h-10">
      ${Array.from({ length: span })
        .map(
          () => `
          <div class="flex-1 bg-gray-100 rounded border border-gray-300 group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors"></div>
        `,
        )
        .join("")}
    </div>
    <div class="text-xs font-medium text-gray-600 group-hover:text-blue-600 transition-colors">
      ${label}
    </div>
  </div>
`;

export const layouts = [
  {
    id: "1-col",
    label: "1 Column",
    media: columnPreview(1, "1 Column"),
    content: {
      type: "section",
      style: { display: "flex", padding: "20px", gap: "20px" },
      components: [{ type: "column", style: { flex: 1, minHeight: "50px" } }],
    },
  },
  {
    id: "2-col",
    label: "2 Columns",
    media: columnPreview(2, "2 Columns"),
    content: {
      type: "section",
      style: { display: "flex", padding: "20px", gap: "20px" },
      components: [
        { type: "column", style: { flex: 1, minHeight: "50px" } },
        { type: "column", style: { flex: 1, minHeight: "50px" } },
      ],
    },
  },
  {
    id: "3-col",
    label: "3 Columns",
    media: columnPreview(3, "3 Columns"),
    content: {
      type: "section",
      style: { display: "flex", padding: "20px", gap: "20px" },
      components: [
        { type: "column", style: { flex: 1, minHeight: "50px" } },
        { type: "column", style: { flex: 1, minHeight: "50px" } },
        { type: "column", style: { flex: 1, minHeight: "50px" } },
      ],
    },
  },
  {
    id: "4-col",
    label: "4 Columns",
    media: columnPreview(4, "4 Columns"),
    content: {
      type: "section",
      style: { display: "flex", padding: "20px", gap: "20px" },
      components: [
        { type: "column", style: { flex: 1, minHeight: "50px" } },
        { type: "column", style: { flex: 1, minHeight: "50px" } },
        { type: "column", style: { flex: 1, minHeight: "50px" } },
        { type: "column", style: { flex: 1, minHeight: "50px" } },
      ],
    },
  },
];

export const section = {
  model: {
    defaults: {
      tagName: "section",
      classes: ["section"],
      droppable: ".column",
      stylable: true,
    },
  },
};

export const column = {
  model: {
    defaults: {
      tagName: "div",
      classes: ["column"],
      draggable: ".section",
      stylable: true,
    },
  },
};

const blockPreview = (label: string, icon: string) => `
  <div class="group flex flex-col items-center gap-3 p-3 w-full rounded-lg border border-gray-200 bg-white cursor-grab transition-all hover:shadow-md hover:border-blue-500 hover:border-dashed select-none">
    <div class="flex items-center justify-center w-full h-10 text-gray-400 group-hover:text-blue-500 transition-colors">
      ${icon}
    </div>
    <div class="text-xs font-medium text-gray-600 group-hover:text-blue-600 transition-colors">
      ${label}
    </div>
  </div>
`;

export const blocks = [
  {
    id: "image",
    label: "Image",
    media: blockPreview(
      "Image",
      `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
    ),
    content: { type: "image" },
  },
  {
    id: "divider",
    label: "Divider",
    media: blockPreview(
      "Divider",
      `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
    ),
    content: {
      tagName: "hr",
      style: {
        width: "100%",
        height: "1px",
        backgroundColor: "#ccc",
        border: "none",
        margin: "20px 0",
      },
    },
  },
  {
    id: "section",
    label: "Section",
    media: blockPreview(
      "Section",
      `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/></svg>`,
    ),
    content: { type: "section", style: { padding: "20px", minHeight: "50px" } },
  },
  {
    id: "heading",
    label: "Heading",
    media: blockPreview(
      "Heading",
      `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 12h12"/><path d="M6 20V4"/><path d="M18 20V4"/></svg>`,
    ),
    content: {
      type: "text",
      tagName: "h1",
      content: "Heading",
      style: { fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem" },
    },
  },
  {
    id: "text",
    label: "Text",
    media: blockPreview(
      "Text",
      `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>`,
    ),
    content: {
      type: "text",
      content: "Insert your text here",
      style: { lineHeight: "1.5" },
    },
  },
  {
    id: "link",
    label: "Link",
    media: blockPreview(
      "Link",
      `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
    ),
    content: {
      type: "link",
      content: "Link Text",
      attributes: { href: "#" },
      style: { color: "#3b82f6", textDecoration: "underline" },
    },
  },
  {
    id: "logo",
    label: "Logo",
    media: blockPreview(
      "Logo",
      // Using a generic image icon for the preview
      `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
    ),
    // The content is now an image type, which will trigger our asset manager
    content: {
      type: "image",
      // Optional: Add some default styles for a logo
      style: {
        width: "150px",
        height: "auto",
      },
    },
  },
  {
    id: "button",
    label: "Button",
    media: blockPreview(
      "Button",
      `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="8" rx="2" ry="2"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`,
    ),
    content: {
      type: "link",
      content: "Button",
      attributes: { href: "#" },
      style: {
        display: "inline-block",
        padding: "10px 20px",
        "background-color": "#3b82f6",
        color: "#ffffff",
        "border-radius": "5px",
        "text-decoration": "none",
        "text-align": "center",
        cursor: "pointer",
      },
    },
  },
  {
    id: "quote",
    label: "Quote",
    media: blockPreview(
      "Quote",
      `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/></svg>`,
    ),
    content: {
      tagName: "blockquote",
      content: "Insert your quote here",
      style: {
        borderLeft: "4px solid #ccc",
        paddingLeft: "1rem",
        margin: "1rem 0",
        fontStyle: "italic",
        color: "#555",
      },
    },
  },
  {
    id: "list",
    label: "List",
    media: blockPreview(
      "List",
      `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
    ),
    content: {
      tagName: "ul",
      components: [
        { tagName: "li", content: "List item 1" },
        { tagName: "li", content: "List item 2" },
        { tagName: "li", content: "List item 3" },
      ],
      style: { paddingLeft: "20px" },
    },
  },
  {
    id: "video",
    label: "Video",
    media: blockPreview(
      "Video",
      `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>`,
    ),
    content: { type: "video", style: { height: "350px", width: "100%" } },
  },
  {
    id: "map",
    label: "Map",
    media: blockPreview(
      "Map",
      `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>`,
    ),
    content: { type: "map", style: { height: "350px", width: "100%" } },
  },
];

const PERSONALIZATION_VARIABLES = [
  {
    label: "Contact Fields",
    options: [
      { value: "{{firstName}}", label: "First Name" },
      { value: "{{lastName}}", label: "Last Name" },
      { value: "{{fullName}}", label: "Full Name" },
      { value: "{{email}}", label: "Email Address" },
      { value: "{{phone}}", label: "Phone Number" },
    ],
  },
  {
    label: "Company Fields",
    options: [
      { value: "{{companyName}}", label: "Company Name" },
      { value: "{{companyWebsite}}", label: "Company Website" },
      { value: "{{industry}}", label: "Industry" },
    ],
  },
  {
    label: "Email Fields",
    options: [
      { value: "{{subject}}", label: "Email Subject" },
      { value: "{{preheader}}", label: "Preheader Text" },
      { value: "{{unsubscribeUrl}}", label: "Unsubscribe Link" },
    ],
  },
  {
    label: "Product Fields",
    options: [
      { value: "{{productName}}", label: "Product Name" },
      { value: "{{productPrice}}", label: "Product Price" },
      { value: "{{productUrl}}", label: "Product URL" },
    ],
  },
];

// Flatten for easy access
const ALL_VARIABLES = PERSONALIZATION_VARIABLES.flatMap((group) =>
  group.options.map((opt) => opt.value),
);
export function createPersonalizationDropdown(editor: Editor, rte: any) {
  // Remove any previously open dropdown to avoid duplicates
  const existingDropdown = document.querySelector(".personalization-dropdown");
  if (existingDropdown) {
    existingDropdown.remove();
  }

  // Create the root dropdown container element
  const dropdown = document.createElement("div");
  dropdown.className = "personalization-dropdown";

  dropdown.innerHTML = `
    <div class="personalization-dropdown-body">
      ${PERSONALIZATION_VARIABLES.map(
        (group) => ` 
        <div class="personalization-group">
          <div class="personalization-group-label">${group.label}</div>
          ${group.options
            .map(
              (option) => `
            <div 
              class="personalization-option" 
              data-variable="${option.value}" 
            >
              <span class="personalization-option-label">${option.label}</span>
              <code class="personalization-option-value">${option.value}</code>
            </div>
          `,
            )
            .join("")} 
        </div>
      `,
      ).join("")} 
    </div>
  `;

  // Try to attach the dropdown to the RTE toolbar so it appears in the right place
  const rteToolbar = document.querySelector(".gjs-rte-toolbar");
  if (rteToolbar) {
    rteToolbar.appendChild(dropdown); // Append inside the toolbar if found
  } else {
    document.body.appendChild(dropdown); // Fall back to appending to the body if toolbar isn't found
  }

  // Attach click listeners to each variable option in the dropdown
  dropdown.querySelectorAll(".personalization-option").forEach((option) => {
    option.addEventListener("click", () => {
      const variable = option.getAttribute("data-variable"); 
      if (variable) {
        editor.runCommand("insert-variable", { variable });
        dropdown.remove(); 
      }
    });
  });
}
