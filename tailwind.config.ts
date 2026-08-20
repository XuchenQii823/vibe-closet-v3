import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";
import containerQueries from "@tailwindcss/container-queries";

// 说明：本配置 1:1 移植自原型 vibe_closet_your_digital_wardrobe.html 内联的 tailwind.config，
// 保证所有页面的颜色 / 字体 / 圆角(0px) / 间距 token 与原型完全一致，实现 100% 视觉还原。
const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    // 项目现在作为作品集里的固定手机 Demo 呈现：真实浏览器再宽，也不触发桌面断点。
    // 内部唯一布局基准是 iPhone 17 Pro 402×874，由 PhoneFrame 承载。
    screens: {
      sm: "99999px",
      md: "99999px",
      lg: "99999px",
      xl: "99999px",
      "2xl": "99999px",
    },
    extend: {
      colors: {
        "on-error-container": "#93000a",
        "surface-tint": "#37675f",
        "on-primary": "#ffffff",
        "primary-container": "#a8dad0",
        "on-surface": "#211a14",
        "on-tertiary": "#ffffff",
        "error-container": "#ffdad6",
        outline: "#707976",
        "on-background": "#211a14",
        "on-error": "#ffffff",
        secondary: "#765658",
        "surface-container-low": "#fff1e6",
        "on-tertiary-fixed": "#1c1b1b",
        "surface-dim": "#e5d8cd",
        "primary-fixed": "#baede2",
        "on-primary-fixed": "#00201c",
        "outline-variant": "#c0c8c5",
        "surface-bright": "#fff8f4",
        primary: "#37675f",
        "on-surface-variant": "#404846",
        "secondary-fixed-dim": "#e5bdbf",
        error: "#ba1a1a",
        "secondary-fixed": "#ffdadb",
        "primary-fixed-dim": "#9fd0c6",
        "inverse-surface": "#372f28",
        surface: "#fff8f4",
        "inverse-primary": "#9fd0c6",
        "surface-variant": "#eee0d5",
        background: "#F5E7DC",
        "surface-container-high": "#f4e6db",
        "on-primary-container": "#316159",
        "inverse-on-surface": "#fceee3",
        "surface-container-lowest": "#ffffff",
        "on-secondary": "#ffffff",
        "tertiary-fixed": "#e5e2e1",
        "surface-container-highest": "#eee0d5",
        "surface-container": "#faebe0",
        "on-secondary-fixed-variant": "#5c3f41",
        "on-tertiary-container": "#595858",
        "secondary-container": "#ffd6d8",
        "on-secondary-fixed": "#2c1517",
        "on-secondary-container": "#7a5b5d",
        "tertiary-container": "#d2cfcf",
        "on-tertiary-fixed-variant": "#474746",
        "on-primary-fixed-variant": "#1d4e47",
        tertiary: "#5f5e5e",
        "tertiary-fixed-dim": "#c8c6c5",
        "brand-mint": "#A8DAD0",
        "brand-blush": "#F2C9CB",
        "brand-black": "#1A1A1A",
      },
      borderRadius: {
        DEFAULT: "0px",
        lg: "0px",
        xl: "0px",
        full: "9999px", // 例外：选择圆点 / favorite pip / 状态灯保留圆形（见 MASTER §4）
      },
      spacing: {
        "margin-mobile": "16px",
        "margin-desktop": "40px",
        "max-width": "1280px",
        gutter: "16px",
        unit: "4px",
      },
      fontFamily: {
        "label-sm": ["Space Mono", "monospace"],
        "headline-lg": ["Space Mono", "monospace"],
        "headline-sm": ["Space Mono", "monospace"],
        "headline-md": ["Space Mono", "monospace"],
        "body-md": ["DM Sans", "sans-serif"],
        "label-lg": ["Space Mono", "monospace"],
        "headline-lg-mobile": ["Space Mono", "monospace"],
        "body-lg": ["DM Sans", "sans-serif"],
      },
      fontSize: {
        "label-sm": ["12px", { lineHeight: "14px", fontWeight: "400" }],
        "headline-lg": [
          "40px",
          { lineHeight: "48px", letterSpacing: "-0.02em", fontWeight: "700" },
        ],
        "headline-sm": ["18px", { lineHeight: "24px", fontWeight: "700" }],
        "headline-md": ["24px", { lineHeight: "32px", fontWeight: "700" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "label-lg": ["14px", { lineHeight: "16px", fontWeight: "700" }],
        "headline-lg-mobile": ["32px", { lineHeight: "36px", fontWeight: "700" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
      },
    },
  },
  plugins: [forms, containerQueries],
};

export default config;
