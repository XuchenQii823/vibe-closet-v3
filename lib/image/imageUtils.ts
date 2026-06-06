// ===== 图片压缩：File → canvas 缩放 → base64 dataURL =====
// 目的：单品图存 localStorage（配额 ~5MB），必须先压缩，否则几张原图就撑满。

const MAX_EDGE = 1000; // 长边上限 px
const QUALITY = 0.7; // JPEG 质量

export class ImageError extends Error {}

/** 校验是否为图片文件。 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

/**
 * 读取图片文件，按长边 ≤ MAX_EDGE 缩放，输出 JPEG base64 dataURL。
 * 失败抛 ImageError（非图片 / 解码失败）。
 */
export async function compressImage(file: File): Promise<string> {
  if (!isImageFile(file)) {
    throw new ImageError("不是图片文件");
  }
  const dataUrl = await readAsDataURL(file);
  const img = await loadImage(dataUrl);

  const { width, height } = scaleSize(img.naturalWidth, img.naturalHeight);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new ImageError("无法创建画布上下文");

  // 米色底铺底，保证透明 PNG 转 JPEG 后不出现黑底（贴合「统一米底」设计要求）
  ctx.fillStyle = "#F5E7DC";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  return canvas.toDataURL("image/jpeg", QUALITY);
}

function scaleSize(w: number, h: number): { width: number; height: number } {
  if (w <= MAX_EDGE && h <= MAX_EDGE) return { width: w, height: h };
  const ratio = w > h ? MAX_EDGE / w : MAX_EDGE / h;
  return { width: Math.round(w * ratio), height: Math.round(h * ratio) };
}

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new ImageError("读取文件失败"));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new ImageError("图片解码失败"));
    img.src = src;
  });
}
