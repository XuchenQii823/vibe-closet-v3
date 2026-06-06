import { StyleSkill } from "../closet/types";

// ===== 4 个预设风格 Skill（前端静态常量，不持久化）=====
// 图片沿用原型的 Google 占位图，保证视觉与 HTML 原型一致。
// 默认高亮 id=4「Poolside Retro」，保证 AI 有明确风格方向（TODO §3.3）。

export const DEFAULT_SKILL_ID = 4;

export const STYLE_SKILLS: StyleSkill[] = [
  {
    id: 1,
    title: "90s Chanel Chic",
    desc: "Tweed, chains, and structured nostalgia.",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD8Mjl9flz1r1h1rlnZi_WD4XIdwr76RXiTDUptIBGhiW3gjlcQT6wiemrfXj4X_HcgIbWbNUKsrreHkK0huENqV9h7GpIJAno02KcUwSEvOQvo47cTMlwuujGAw-HkwZUQoG52-WBfc6PkVJ8qKDshSwRD_-MG5d2joCNcvSL9XZDI8Se2wnEx3kShPVAF_TpurvIYnGsBwVTUiyQrtMe6biJftVvw14Ziaph7O3FLYOhyWu8nAtzkzHW7jxXDthugMvlePEVs3c0",
    color: "bg-primary",
    promptHint: "90 年代香奈儿风：粗花呢、链条、结构感、复古优雅。",
  },
  {
    id: 2,
    title: "Prada Minimalism",
    desc: "Nylon, sharp lines, utilitarian edge.",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuC8ffErfC8IFOvlmSf6u5x-h7aDHBYUt7uBpLkZ-nmXMI30IfD7iBoHdPvCZKdVjZB01K2srVbN0Wv7NUy7Qd87W7791_acblEC2r66ZkC_mXxlUQNrorHAxaCbf-sU2jH1K5Ll7_X-OBmlsBQTxGTMPlk-nLFY7y_SAGJMStfw4vSQXNZt3RugSFozEKq3_Nd4F9dY8fJ4juyAlqLgHlTfGPrzSzsoVjdVUVrkUhdqsz_j_OzhmZyrL0lqi9x7mxW52Oxcl1XrPvA",
    color: "bg-tertiary-container",
    promptHint: "Prada 极简风：尼龙、利落线条、实用主义、冷调。",
  },
  {
    id: 3,
    title: "Westwood Punk",
    desc: "Tartan, rebellion, asymmetric cuts.",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDJhJZrOgdoDuSSwVfVW6xKk8cOt-fARNT8qF6ZNYB18AjwDJZLO3TShIvAOLEluIXgKQv5lALcNUe9GQNG5R6SAlS2lbb4xi1PzEsSOqdgfVWQrWomcs9ot7WXAONo0MpaSdxY5lP1y_uoWlaOs_dJg7q54J-2Ipxm9s_0bY52sG0RUkg0b5LdnGgPPs6r-cR_b1PBUWRaN5eagQZOh4V5gW0QzAJYBwNzX2JxMknnbTc8gfErRm4_eun5XrFqRwRKxDGV28bxBhY",
    color: "bg-error-container",
    promptHint: "Westwood 朋克风：格纹、叛逆、不对称剪裁、张扬。",
  },
  {
    id: 4,
    title: "Poolside Retro",
    desc: "Pastels, terrycloth, endless summer.",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCaIFL9BFmqNzmRCiL8x6MeBi97D6z2Le32c4sT7PnF5Zd3tLzZGlDvJN8eW4YuYczf-5qwA-kK08kHjNVJisZj9jy7_BJW6OSdYXOjbs1vf4vk1-raGJiVkB532tzOKzg3XnRiKWHg0wKA1edj8XU_rpujSvEZwgFnyfHKDuOgiXmSKPN7WNNbHBt3nQGjw4NE98qvsiDIb2gLuPU5_NZYEgpBBVxZbkfNdkUxiyh0xJ1FeWBDGq-SyHvM3-dlcwMWrGea_wgXSY4",
    color: "bg-primary-container",
    promptHint: "Poolside 度假风：粉彩、毛巾布、慵懒夏日、海岸感。",
  },
];

export function getSkillById(id: number): StyleSkill | undefined {
  return STYLE_SKILLS.find((s) => s.id === id);
}
