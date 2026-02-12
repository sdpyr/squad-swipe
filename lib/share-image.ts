export type ShareImageData = {
  matchedTitle: string;
  winnerName: string;
};

export async function generateShareImage(data: ShareImageData) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("canvas-not-supported");
  }

  const bg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  bg.addColorStop(0, "#0b1020");
  bg.addColorStop(1, "#1d4ed8");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.textAlign = "center";
  ctx.fillStyle = "#e2e8f0";

  ctx.font = "700 64px Inter, Arial, sans-serif";
  ctx.fillText("Tonight's Squad Plan", canvas.width / 2, 280);

  ctx.font = "600 54px Inter, Arial, sans-serif";
  wrapText(ctx, data.matchedTitle, canvas.width / 2, 760, 820, 72);

  ctx.font = "500 48px Inter, Arial, sans-serif";
  ctx.fillText(`Wheel: ${data.winnerName}`, canvas.width / 2, 1140);

  ctx.font = "500 42px Inter, Arial, sans-serif";
  ctx.fillStyle = "#bfdbfe";
  ctx.fillText("Chosen with SQUAD", canvas.width / 2, 1700);

  const dataUrl = canvas.toDataURL("image/png");
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob((b) => resolve(b), "image/png"));
  if (!blob) {
    throw new Error("blob-failed");
  }

  const file = new File([blob], "squad-story.png", { type: "image/png" });
  return { dataUrl, file };
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(" ");
  let line = "";
  const lines: string[] = [];

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    const width = ctx.measureText(test).width;
    if (width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);

  let offsetY = y;
  for (const row of lines.slice(0, 3)) {
    ctx.fillText(row, x, offsetY);
    offsetY += lineHeight;
  }
}
