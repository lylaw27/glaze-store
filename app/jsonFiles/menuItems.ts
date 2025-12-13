import { MenuItem } from "@/types"

export const MENU: MenuItem[] = [
//   {
//     label: "最新款式",
//     href: "/new",
//   },
  {
    label: "手鏈 ▼",
    dropdown: [
      {
        title: "一鏈兩戴款",
        links: [
          { label: "鍍銀系列", href: "/collections/knit" },
          { label: "14K鍍金系列", href: "/collections/wavy-heart" },
          { label: "Minimal", href: "/collections/minimal" },
        ],
      },
      {
        title: "常規款",
        links: [
          { label: "鍍銀系列", href: "/materials/925" },
          { label: "14K鍍金系列", href: "/materials/14k" },
        ],
      },
      {
        title: "925純銀",
        links: [
          { label: "極簡自由調節鏈款", href: "/necklaces/collarbone" },
        ],
      },
      {
        links: [
          { label: "念珠款", href: "/bracelet-accessories" },
        ],
      },
    ],
    promos: [
      { image: "/images/product22-1.jpeg", alt: "精選款式", caption: "精選款式", href: "/collections/featured" },
      { image: "/images/product21-1.jpeg", alt: "黑太陽石", caption: "黑太陽石", href: "/crystal/black-sunstone" },
    ],
  },
  {
    label: "頸鏈 ▼",
    dropdown: [
      {
        links: [
          { label: "925純銀", href: "/bracelets/double" },
        ],
      },
    ],
    promos: [
      { image: "/images/product16-1.jpeg", alt: "熱賣款", caption: "熱賣款", href: "/collections/bestsellers" },
      { image: "/images/product19-1.jpeg", alt: "黑曜石", caption: "黑曜石", href: "/crystal/obsidian" },
    ],
  },
  { label: "耳環 ▼", 
    dropdown: [
      {
        links: [
          { label: "925純銀", href: "/bracelets/double" },
        ],
      },
    ],
   },
  {
    label: "功效類別 ▼",
    dropdown: [
      {
        links: [
            { label: "招財事業", href: "/necklaces/moonstone" },
            { label: "愛情人緣", href: "/necklaces/garnet" },
            { label: "防護淨化", href: "/necklaces/topaz" },
            { label: "健康保護", href: "/necklaces/moonstone" },
            { label: "情緒療癒", href: "/necklaces/garnet" },
            { label: "全面能量", href: "/necklaces/topaz" },
        ],
      },
    ],
    promos: [
      { image: "/images/product14-1.jpeg", alt: "新品推薦", caption: "新品推薦", href: "/collections/new" },
      { image: "/images/product12-1.jpeg", alt: "暢銷項鏈", caption: "暢銷項鏈", href: "/collections/top-necklaces" },
    ],
  },
  {
    label: "五行能量水晶 ▼",
    dropdown: [
      {
        links: [
          { label: "金系水晶", href: "/crystal/spiritual" },
          { label: "木系水晶", href: "/crystal/cleanse" },
          { label: "水系水晶", href: "/crystal/heal" },
          { label: "火系水晶", href: "/crystal/cleanse" },
          { label: "土系水晶", href: "/crystal/cleanse" },
        ],
      },
    ],
    promos: [
      { image: "/images/product8-1.jpeg", alt: "人氣搭配", caption: "人氣搭配", href: "/collections/popular-set" },
      { image: "/images/product10-1.jpeg", alt: "風格推薦", caption: "風格推薦", href: "/collections/styles" },
    ],
  },
  {
    label: "客製服務 ▼",
    dropdown: [
      {
        links: [
          { label: "個人專屬水晶設計", href: "/home/decor" },
          { label: "能量組合訂製", href: "/home/stone" },
          { label: "生辰五行配對", href: "/home/stone" },
        ],
      },
    ],
    promos: [{ image: "/images/hero4-1.jpeg", alt: "家居專區", caption: "家居專區", href: "/home" }],
  },
  {
    label: "水晶知識 Blog ▼",
    dropdown: [
      {
        links: [
          { label: "水晶保養指南", href: "/blog" },
          { label: "銀飾保養指南", href: "/blog/story" },
        ],
      },
    ],
  },
  {
    label: "關於我們 ▼",
    dropdown: [
      {
        links: [
          { label: "品牌故事", href: "/stores" },
          { label: "聯絡我們", href: "/rewards" },
        ],
      },
    ],
  },
]