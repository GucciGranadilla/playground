export interface WorkImage {
  src: string;
  width: number;
  height: number;
}

export interface WorkGridImage extends WorkImage {
  type: "image";
  gridSpan: 2 | 3 | 4 | 5 | 6 | 8;
  aspectRatio: string;
}

export interface WorkGridVideo {
  type: "video";
  mobileSrc: string;
  desktopSrc: string;
  gridSpan: 2 | 3 | 4 | 5 | 6 | 8;
  aspectRatio: string;
}

export type WorkGridItem = WorkGridImage | WorkGridVideo;

export interface WorkItem {
  slug: string;
  client: string;
  title: string;
  excerpt: string;
  year: number;
  featured?: boolean;
  heroImage: WorkImage;
  cardImage: WorkImage;
  images: WorkGridItem[];
}

const RAW = [
  {
    slug: "tesla-volt-r2",
    client: "Tesla",
    title: "Volt R2",
    excerpt: "Campaign direction and visual identity for Tesla's next-generation performance vehicle.",
    year: 2024,
    featured: true,
    src: "/images/tesla.webp",
    width: 896,
    height: 1344,
  },
  {
    slug: "chanel-eclat",
    client: "Chanel",
    title: "Éclat",
    excerpt: "Fragrance campaign blending archival fashion photography with contemporary art direction.",
    year: 2024,
    featured: true,
    src: "/images/chanel.webp",
    width: 1232,
    height: 928,
  },
  {
    slug: "apple-project-ion",
    client: "Apple",
    title: "Project Ion",
    excerpt: "Product launch experience for Apple's most ambitious hardware category to date.",
    year: 2025,
    featured: true,
    src: "/images/apple.webp",
    width: 2464,
    height: 1856,
  },
  {
    slug: "bmw-aeroline",
    client: "BMW",
    title: "AeroLine",
    excerpt: "Motion and editorial direction for BMW's aerodynamic design language refresh.",
    year: 2024,
    featured: true,
    src: "/images/BMW.webp",
    width: 896,
    height: 1344,
  },
  {
    slug: "ysl-serie-noir",
    client: "Saint Laurent",
    title: "Série Noir",
    excerpt: "A study in restraint — campaign identity for Saint Laurent's limited collector series.",
    year: 2024,
    featured: true,
    src: "/images/YSL.webp",
    width: 1200,
    height: 1008,
  },
  {
    slug: "nike-ultrarun",
    client: "Nike",
    title: "UltraRun",
    excerpt: "Performance campaign capturing the precision engineering behind Nike's elite running platform.",
    year: 2023,
    src: "/images/nike.webp",
    width: 1232,
    height: 928,
  },
  {
    slug: "hermes-atelier-03",
    client: "Hermès",
    title: "Atelier 03",
    excerpt: "Craft-first content series documenting the making of Hermès' third atelier collection.",
    year: 2024,
    src: "/images/hermes.webp",
    width: 1024,
    height: 1056,
  },
  {
    slug: "adidas-pulse-one",
    client: "Adidas",
    title: "Pulse One",
    excerpt: "Brand story for Adidas' first fully generative design process footwear release.",
    year: 2023,
    src: "/images/adidas.webp",
    width: 1024,
    height: 1024,
  },
  {
    slug: "prada-linea-24",
    client: "Prada",
    title: "Linea 24",
    excerpt: "Seasonal editorial direction for Prada's continuous 24-hour content programme.",
    year: 2024,
    src: "/images/prada.webp",
    width: 1232,
    height: 928,
  },
  {
    slug: "google-echo-series",
    client: "Google",
    title: "Echo Series",
    excerpt: "Product and experience design for Google's Echo Series ambient computing line.",
    year: 2025,
    src: "/images/google.webp",
    width: 896,
    height: 1344,
  },
  {
    slug: "polestar-zero",
    client: "Polestar",
    title: "Zero",
    excerpt: "Visual manifesto for Polestar's carbon-zero vehicle, launching ahead of 2030 targets.",
    year: 2024,
    src: "/images/polestar.webp",
    width: 1024,
    height: 1024,
  },
  {
    slug: "balenciaga-shift-black",
    client: "Balenciaga",
    title: "Shift/Black",
    excerpt: "Conceptual campaign challenging conventional luxury through Balenciaga's Shift collection.",
    year: 2023,
    src: "/images/balenciaga.webp",
    width: 1376,
    height: 880,
  },
  {
    slug: "audi-solar-drift",
    client: "Audi",
    title: "Solar Drift",
    excerpt: "Campaign identity for Audi's first solar-augmented electric performance edition.",
    year: 2024,
    src: "/images/audi.webp",
    width: 896,
    height: 1344,
  },
  {
    slug: "valentino-no-27",
    client: "Valentino",
    title: "Nº 27",
    excerpt: "Editorial series for Valentino's archival fragrance line, reissued for a new generation.",
    year: 2024,
    src: "/images/valentino.webp",
    width: 1232,
    height: 976,
  },
  {
    slug: "samsung-mode-3",
    client: "Samsung",
    title: "Mode/3",
    excerpt: "Launch direction for Samsung's third-generation foldable device platform.",
    year: 2025,
    src: "/images/samsung.webp",
    width: 1232,
    height: 928,
  },
  {
    slug: "bottega-pure-form",
    client: "Bottega Veneta",
    title: "Pure Form",
    excerpt: "Art direction centred on material honesty and silence for Bottega Veneta's core collection.",
    year: 2023,
    src: "/images/bottega.webp",
    width: 1024,
    height: 1024,
  },
  {
    slug: "sony-edge",
    client: "Sony",
    title: "Edge",
    excerpt: "Technology storytelling for Sony's Edge series — where engineering meets sensory design.",
    year: 2024,
    src: "/images/sony.webp",
    width: 896,
    height: 1344,
  },
  {
    slug: "aesop-stillwater",
    client: "Aesop",
    title: "Stillwater",
    excerpt: "Brand narrative for Aesop's water-based skincare range and its environmental commitments.",
    year: 2024,
    src: "/images/aesop.webp",
    width: 1232,
    height: 976,
  },
  {
    slug: "dior-parfum-no8",
    client: "Dior",
    title: "Parfum Nº8",
    excerpt: "Collector fragrance campaign drawing on the archive of Christian Dior's personal correspondence.",
    year: 2023,
    src: "/images/dior.webp",
    width: 1072,
    height: 1024,
  },
  {
    slug: "porsche-vantage",
    client: "Porsche",
    title: "Vantage",
    excerpt: "Anniversary campaign for Porsche's Vantage edition, spanning sixty years of design evolution.",
    year: 2024,
    src: "/images/porsche.webp",
    width: 896,
    height: 1344,
  },
  {
    slug: "microsoft-core",
    client: "Microsoft",
    title: "Core",
    excerpt: "Campaign direction for Microsoft's Core platform — the infrastructure behind creative work.",
    year: 2025,
    src: "/images/microsoft.webp",
    width: 1232,
    height: 928,
  },
  {
    slug: "lexus-archive-green",
    client: "Lexus",
    title: "Archive Green",
    excerpt: "Limited colour programme for Lexus exploring the intersection of tradition and innovation.",
    year: 2024,
    src: "/images/lexus.webp",
    width: 1024,
    height: 1024,
  },
  {
    slug: "mercedes-rosso-linea",
    client: "Mercedes-Benz",
    title: "Rosso Linea",
    excerpt: "Heritage and contemporary fusion — campaign for Mercedes' Italian-inspired design edition.",
    year: 2024,
    src: "/images/mercedes.webp",
    width: 1232,
    height: 928,
  },
  {
    slug: "huawei-a-17",
    client: "Huawei",
    title: "A-17",
    excerpt: "Global launch campaign for Huawei's A-17 handset, designed for the creative professional.",
    year: 2025,
    src: "/images/huawei.webp",
    width: 1024,
    height: 1024,
  },
];

const VIDEO_CONFIGS: Array<{ pos: number; gridSpan: 2 | 3 | 4 | 5 | 6 | 8; aspectRatio: string }> = [
  { pos: 4, gridSpan: 8, aspectRatio: "16/9" },
  { pos: 10, gridSpan: 4, aspectRatio: "4/3" },
  { pos: 16, gridSpan: 8, aspectRatio: "16/9" },
];
const VIDEO_POSITIONS = new Set(VIDEO_CONFIGS.map((v) => v.pos));

const IMAGE_SPANS: (2 | 3 | 4 | 5 | 6 | 8)[] = [
  8, 5, 3, 8,            // before video 0
  6, 2, 8, 4, 4,         // between video 0 and video 1
  4,                      // pairs with video 1 (span 4)
  8, 5, 3, 8,            // after that pair, before video 2
  4, 4, 8, 3, 5, 8, 2, 6, 8, // after video 2
];

const IMAGE_ASPECT_RATIOS: string[] = [
  "16/9", "4/3",  "3/4",  "16/9",
  "3/2",  "1/1",  "16/9", "3/4",  "4/3",
  "4/3",
  "16/9", "3/2",  "2/3",  "16/9",
  "1/1",  "3/4",  "21/9", "2/3",  "4/3",  "16/9", "1/1",  "3/2",  "16/9",
];

const TEST_VIDEOS = [
  "https://d65yv7cdap2m4.cloudfront.net/videos/c4468a14-0f09-4ee0-82da-77e336bd6666-Cricket1_EDA_1080p.mp4",
  "https://d65yv7cdap2m4.cloudfront.net/videos/cc6ddbd4-f9df-45fc-85e6-dee1d848222a-Turbotax-Side-Hustles-Adeel-Shamsi-Preview-01_1080p.mp4",
  "https://d65yv7cdap2m4.cloudfront.net/videos/3b9b532b-5a35-45b4-a405-0bc3e463642c-The-North-Face-Adventure-Is-For-Everyone-1080p-Preview-01_1080p.mp4",
];

export const WORK_ITEMS: WorkItem[] = RAW.map((item, i) => {
  const img: WorkImage = {
    src: item.src,
    width: item.width,
    height: item.height,
  };
  const others = RAW.filter((_, j) => j !== i);

  const images: WorkGridItem[] = [];
  let imgIdx = 0;
  let videoIdx = 0;

  for (let pos = 0; pos < others.length + VIDEO_POSITIONS.size; pos++) {
    if (VIDEO_POSITIONS.has(pos)) {
      const src = TEST_VIDEOS[videoIdx % TEST_VIDEOS.length];
      const config = VIDEO_CONFIGS[videoIdx % VIDEO_CONFIGS.length];
      images.push({
        type: "video",
        mobileSrc: src,
        desktopSrc: src,
        gridSpan: config.gridSpan,
        aspectRatio: config.aspectRatio,
      });
      videoIdx++;
    } else {
      const o = imgIdx === 0 ? item : others[imgIdx - 1];
      images.push({
        type: "image",
        src: o.src,
        width: o.width,
        height: o.height,
        gridSpan: IMAGE_SPANS[imgIdx] ?? 8,
        aspectRatio: IMAGE_ASPECT_RATIOS[imgIdx] ?? "16/9",
      });
      imgIdx++;
    }
  }

  return {
    slug: item.slug,
    client: item.client,
    title: item.title,
    excerpt: item.excerpt,
    year: item.year,
    featured: item.featured ?? false,
    heroImage: img,
    cardImage: img,
    images,
  };
});
