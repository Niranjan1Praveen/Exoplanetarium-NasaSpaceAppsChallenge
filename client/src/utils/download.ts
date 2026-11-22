// Small helpers for letting users save charts and text from the page.

// Trigger a browser download for a URL (data: or blob:)
function save(href: string, name: string) {
  const link = document.createElement("a");
  link.download = name;
  link.href = href;
  link.click();
}

// Snapshot a DOM node as a PNG; dom-to-image is loaded only when someone exports
export async function downloadNode(node: HTMLElement | null, name: string) {
  if (!node) return;
  try {
    const { default: domtoimage } = await import("dom-to-image");
    const url = await domtoimage.toPng(node, {
      bgcolor: "#000000",
      style: { transform: "scale(2)", transformOrigin: "center" },
      quality: 1.0,
    });
    save(url, `${name}-${Date.now()}.png`);
  } catch (err) {
    console.error("Error downloading chart:", err);
    alert("Failed to download chart. Please try again.");
  }
}

// Save plain text as a .txt file
export function downloadText(text: string, name: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
  save(url, `${name}-${Date.now()}.txt`);
  URL.revokeObjectURL(url);
}
