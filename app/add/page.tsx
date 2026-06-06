"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import TopAppBar from "@/components/TopAppBar";
import MaterialIcon from "@/components/MaterialIcon";
import { useCloset } from "@/lib/hooks/useCloset";
import { compressImage, isImageFile } from "@/lib/image/imageUtils";
import { recognizeImage } from "@/lib/vision/recognizeClient";
import { CATEGORIES, Category } from "@/lib/closet/types";

// ADD NEW ITEM（/add）：拍照/相册 → 压缩预览 → 选类别(必填)/名称/颜色/标签 → 保存。
// 保留原型视觉骨架（取景框四角 + 双按钮 + 预览区 + 底部 NEXT），Scan QR 按 TODO 移除。
export default function AddItemPage() {
  const router = useRouter();
  const { add, error: storeError, clearError } = useCloset();

  const cameraRef = useRef<HTMLInputElement>(null);
  const albumRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [category, setCategory] = useState<Category | "">("");
  const [name, setName] = useState("");
  const [tag, setTag] = useState("");
  const [colorHint, setColorHint] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // 识图状态：'idle' 未识 / 'loading' 识别中 / 'done' 已自动填 / 'manual' 识别未成功需手动
  const [recoStatus, setRecoStatus] = useState<
    "idle" | "loading" | "done" | "manual"
  >("idle");
  const [recoMsg, setRecoMsg] = useState<string | null>(null);

  const onFile = async (file?: File) => {
    if (!file) return;
    clearError();
    if (!isImageFile(file)) {
      setError("请选择图片文件（JPG / PNG / WebP）");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const dataUrl = await compressImage(file);
      setPreview(dataUrl);
      // 压缩成功后自动触发识图（不阻断：失败仅提示，用户仍可手动填）
      void runRecognize(dataUrl);
    } catch (err) {
      console.error("[add] compress fail", {
        message: err instanceof Error ? err.message : "unknown",
      });
      setError("图片处理失败，请换一张试试");
    } finally {
      setBusy(false);
    }
  };

  // 调用 /api/recognize 自动识别类别/颜色/名称并预填（用户仍可手动修改）
  const runRecognize = async (dataUrl: string) => {
    setRecoStatus("loading");
    setRecoMsg(null);
    const resp = await recognizeImage(dataUrl);
    if (resp.ok && resp.result) {
      setCategory(resp.result.category);
      if (resp.result.colorHint) setColorHint(resp.result.colorHint);
      if (resp.result.name) setName(resp.result.name);
      setRecoStatus("done");
      setRecoMsg(`已自动识别为 ${resp.result.category}，可手动调整`);
    } else {
      setRecoStatus("manual");
      setRecoMsg(resp.message || "未能自动识别，请手动选择类别");
    }
  };

  const onSave = () => {
    if (!preview) {
      setError("请先拍照或选择一张图片");
      return;
    }
    if (!category) {
      setError("请选择单品类别");
      return;
    }
    const item = add({
      image: preview,
      category,
      name: name.trim() || undefined,
      tag: tag.trim() || undefined,
      colorHint: colorHint.trim() || undefined,
    });
    if (item) router.push("/closet");
  };

  return (
    <div
      data-testid="add-item-page"
      className="flex flex-col min-h-screen bg-surface"
    >
      <TopAppBar
        title="ADD NEW ITEM"
        leftAction="back"
        onLeftClick={() => router.back()}
        rightAction="none"
      />

      <main className="flex-1 mt-14 mb-[100px] px-margin-mobile py-4 flex flex-col gap-4">
        {/* 隐藏的真实文件输入：拍照（capture）与相册 */}
        <input
          ref={cameraRef}
          data-testid="add-upload-input"
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
        <input
          ref={albumRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0])}
        />

        {/* 取景 / 预览区：有图显图，无图显原型取景框 */}
        <button
          data-testid="add-take-photo"
          onClick={() => cameraRef.current?.click()}
          className="hardware-btn w-full aspect-[4/3] bg-surface-container-lowest border-2 border-on-tertiary-fixed shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] flex flex-col items-center justify-center gap-3 relative overflow-hidden group"
        >
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-on-tertiary-fixed" />
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-on-tertiary-fixed" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-on-tertiary-fixed" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-on-tertiary-fixed" />
          {preview ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                data-testid="add-preview"
                src={preview}
                alt="预览"
                className="absolute inset-0 w-full h-full object-contain p-3"
              />
              {recoStatus === "loading" && (
                // 识别中：终端风遮罩 + scanline
                <div className="absolute inset-0 bg-brand-black/70 flex flex-col items-center justify-center gap-2 scanline">
                  <MaterialIcon
                    name="visibility"
                    className="text-4xl text-brand-mint animate-pulse"
                  />
                  <span className="font-label-sm text-label-sm text-brand-mint uppercase tracking-widest">
                    RECOGNIZING...
                  </span>
                </div>
              )}
            </>
          ) : (
            <>
              <MaterialIcon
                name="photo_camera"
                className="text-6xl text-on-surface group-hover:scale-110 transition-transform duration-300"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}
              />
              <span className="font-headline-sm text-headline-sm text-on-surface uppercase tracking-tight">
                {busy ? "PROCESSING..." : "TAP TO TAKE PHOTO"}
              </span>
            </>
          )}
        </button>

        {/* 相册入口（Scan QR 已按 TODO 移除）*/}
        <div className="flex gap-4">
          <button
            onClick={() => albumRef.current?.click()}
            className="hardware-btn flex-1 bg-secondary-container border-2 border-on-tertiary-fixed shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] py-3 flex items-center justify-center gap-2 px-2"
          >
            <MaterialIcon
              name="photo_library"
              className="text-2xl text-on-surface"
            />
            <span className="font-label-lg text-label-lg text-on-surface text-center uppercase">
              Album
            </span>
          </button>
        </div>

        {/* 识图状态提示（自动识别成功/失败/未配置 Key）*/}
        {recoMsg && (
          <div
            data-testid="add-reco-status"
            className={`border-2 px-3 py-2 font-label-sm text-label-sm flex items-center gap-2 ${
              recoStatus === "done"
                ? "border-on-tertiary-fixed bg-primary-container text-on-tertiary-fixed"
                : "border-on-tertiary-fixed bg-surface-container-high text-on-surface-variant"
            }`}
          >
            <MaterialIcon
              name={recoStatus === "done" ? "check_circle" : "info"}
              className="text-[16px]"
            />
            {recoMsg}
          </div>
        )}

        {/* 元数据表单 */}
        <div className="bg-surface-container-lowest border-2 border-on-tertiary-fixed p-3 flex flex-col gap-3">
          <div>
            <label className="font-label-sm text-label-sm uppercase text-on-tertiary-fixed mb-2 flex items-center gap-2">
              类别 *
              {recoStatus === "loading" && (
                <span className="text-on-surface-variant normal-case tracking-normal">
                  识别中…
                </span>
              )}
            </label>
            <div
              data-testid="add-category-select"
              className="flex flex-wrap gap-2"
            >
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  data-testid={`add-category-${cat}`}
                  data-active={category === cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 border-2 border-on-tertiary-fixed font-label-sm text-label-sm uppercase transition-all ${
                    category === cat
                      ? "bg-on-tertiary-fixed text-on-tertiary"
                      : "bg-surface-container-lowest text-on-tertiary-fixed hover:bg-secondary-container"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <FormField
            label="名称（可选）"
            value={name}
            onChange={setName}
            placeholder="如 Classic White Tee"
          />
          <div className="flex gap-3">
            <FormField
              label="材质标签（可选）"
              value={tag}
              onChange={setTag}
              placeholder="Cotton"
            />
            <FormField
              label="颜色（可选）"
              value={colorHint}
              onChange={setColorHint}
              placeholder="米白"
            />
          </div>
        </div>

        {(error || storeError) && (
          <div
            data-testid="add-error"
            className="border-2 border-error bg-error-container text-on-error-container p-3 font-label-sm text-label-sm"
          >
            {error || storeError}
          </div>
        )}
      </main>

      {/* 底部固定保存条 */}
      <div className="fixed bottom-0 left-0 w-full z-40 px-margin-mobile py-4 bg-surface border-t-2 border-on-tertiary-fixed flex items-center justify-center">
        <button
          data-testid="add-confirm-btn"
          onClick={onSave}
          className="hardware-btn w-full bg-brand-mint border-2 border-on-tertiary-fixed shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] py-4 px-6 flex items-center justify-between"
        >
          <span className="font-headline-md text-headline-md text-on-surface uppercase tracking-tight">
            保存到衣橱
          </span>
          <MaterialIcon
            name="arrow_forward"
            className="text-2xl text-on-surface"
          />
        </button>
      </div>
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex-1">
      <label className="font-label-sm text-label-sm uppercase text-on-tertiary-fixed block mb-2">
        {label}
      </label>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-surface border-2 border-on-tertiary-fixed px-3 py-2 font-body-md text-body-md focus:bg-white focus:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] focus:outline-none transition-all"
      />
    </div>
  );
}
