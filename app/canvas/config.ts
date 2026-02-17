const columnPreview = (span: number, label: string) => `
  <div class="group flex flex-col items-center gap-3 p-3 w-full rounded-lg border border-gray-200 bg-white cursor-grab transition-all hover:shadow-md hover:border-blue-500 hover:border-dashed select-none">
    <div class="flex w-full gap-1 h-10">
      ${Array.from({ length: span })
        .map(
          () => `
          <div class="flex-1 bg-gray-100 rounded border border-gray-300 group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors"></div>
        `
        )
        .join("")}
    </div>
    <div class="text-xs font-medium text-gray-600 group-hover:text-blue-600 transition-colors">
      ${label}
    </div>
  </div>
`;

export const blocks = [
  {
    id: "1-col",
    label: "1 Column",
    media: columnPreview(1, "1 Column"),
    content: {
      type: "section",
      style: { display: "flex", padding: "20px", gap: "20px" },
      components: [{ type: "column", style: { flex: 1 }, content: "Insert your content here" }],
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
        { type: "column", style: { flex: 1 }, content: "Insert your content here" },
        { type: "column", style: { flex: 1 }, content: "Insert your content here" },
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
        { type: "column", style: { flex: 1 }, content: "Insert your content here" },
        { type: "column", style: { flex: 1 }, content: "Insert your content here" },
        { type: "column", style: { flex: 1 }, content: "Insert your content here" },
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
        { type: "column", style: { flex: 1 }, content: "Insert your content here" },
        { type: "column", style: { flex: 1 }, content: "Insert your content here" },
        { type: "column", style: { flex: 1 }, content: "Insert your content here" },
        { type: "column", style: { flex: 1 }, content: "Insert your content here" },
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
