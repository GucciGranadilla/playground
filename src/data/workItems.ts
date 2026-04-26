export interface WorkImage {
  src: string;
  width: number;
  height: number;
}

export interface WorkGridImage extends WorkImage {
  type: "image";
  gridSpan: 4 | 8;
}

export interface WorkGridVideo {
  type: "video";
  mobileSrc: string;
  desktopSrc: string;
  gridSpan: 4 | 8;
}

export type WorkGridItem = WorkGridImage | WorkGridVideo;

export interface WorkItem {
  slug: string;
  client: string;
  title: string;
  heroImage: WorkImage;
  cardImage: WorkImage;
  images: WorkGridItem[];
}

const RAW = [
  {
    slug: "tesla-volt-r2",
    client: "Tesla",
    title: "Volt R2",
    src: "/images/tesla.webp",
    width: 896,
    height: 1344,
  },
  {
    slug: "chanel-eclat",
    client: "Chanel",
    title: "Éclat",
    src: "/images/chanel.webp",
    width: 1232,
    height: 928,
  },
  {
    slug: "apple-project-ion",
    client: "Apple",
    title: "Project Ion",
    src: "/images/apple.webp",
    width: 2464,
    height: 1856,
  },
  {
    slug: "bmw-aeroline",
    client: "BMW",
    title: "AeroLine",
    src: "/images/BMW.webp",
    width: 896,
    height: 1344,
  },
  {
    slug: "ysl-serie-noir",
    client: "Saint Laurent",
    title: "Série Noir",
    src: "/images/YSL.webp",
    width: 1200,
    height: 1008,
  },
  {
    slug: "nike-ultrarun",
    client: "Nike",
    title: "UltraRun",
    src: "/images/nike.webp",
    width: 1232,
    height: 928,
  },
  {
    slug: "hermes-atelier-03",
    client: "Hermès",
    title: "Atelier 03",
    src: "/images/hermes.webp",
    width: 1024,
    height: 1056,
  },
  {
    slug: "adidas-pulse-one",
    client: "Adidas",
    title: "Pulse One",
    src: "/images/adidas.webp",
    width: 1024,
    height: 1024,
  },
  {
    slug: "prada-linea-24",
    client: "Prada",
    title: "Linea 24",
    src: "/images/prada.webp",
    width: 1232,
    height: 928,
  },
  {
    slug: "google-echo-series",
    client: "Google",
    title: "Echo Series",
    src: "/images/google.webp",
    width: 896,
    height: 1344,
  },
  {
    slug: "polestar-zero",
    client: "Polestar",
    title: "Zero",
    src: "/images/polestar.webp",
    width: 1024,
    height: 1024,
  },
  {
    slug: "balenciaga-shift-black",
    client: "Balenciaga",
    title: "Shift/Black",
    src: "/images/balenciaga.webp",
    width: 1376,
    height: 880,
  },
  {
    slug: "audi-solar-drift",
    client: "Audi",
    title: "Solar Drift",
    src: "/images/audi.webp",
    width: 896,
    height: 1344,
  },
  {
    slug: "valentino-no-27",
    client: "Valentino",
    title: "Nº 27",
    src: "/images/valentino.webp",
    width: 1232,
    height: 976,
  },
  {
    slug: "samsung-mode-3",
    client: "Samsung",
    title: "Mode/3",
    src: "/images/samsung.webp",
    width: 1232,
    height: 928,
  },
  {
    slug: "bottega-pure-form",
    client: "Bottega Veneta",
    title: "Pure Form",
    src: "/images/bottega.webp",
    width: 1024,
    height: 1024,
  },
  {
    slug: "sony-edge",
    client: "Sony",
    title: "Edge",
    src: "/images/sony.webp",
    width: 896,
    height: 1344,
  },
  {
    slug: "aesop-stillwater",
    client: "Aesop",
    title: "Stillwater",
    src: "/images/aesop.webp",
    width: 1232,
    height: 976,
  },
  {
    slug: "dior-parfum-no8",
    client: "Dior",
    title: "Parfum Nº8",
    src: "/images/dior.webp",
    width: 1072,
    height: 1024,
  },
  {
    slug: "porsche-vantage",
    client: "Porsche",
    title: "Vantage",
    src: "/images/porsche.webp",
    width: 896,
    height: 1344,
  },
  {
    slug: "microsoft-core",
    client: "Microsoft",
    title: "Core",
    src: "/images/microsoft.webp",
    width: 1232,
    height: 928,
  },
  {
    slug: "lexus-archive-green",
    client: "Lexus",
    title: "Archive Green",
    src: "/images/lexus.webp",
    width: 1024,
    height: 1024,
  },
  {
    slug: "mercedes-rosso-linea",
    client: "Mercedes-Benz",
    title: "Rosso Linea",
    src: "/images/mercedes.webp",
    width: 1232,
    height: 928,
  },
  {
    slug: "huawei-a-17",
    client: "Huawei",
    title: "A-17",
    src: "/images/huawei.webp",
    width: 1024,
    height: 1024,
  },
];

const VIDEO_CONFIGS: Array<{ pos: number; gridSpan: 4 | 8 }> = [
  { pos: 4, gridSpan: 8 },
  { pos: 10, gridSpan: 4 },
  { pos: 16, gridSpan: 8 },
];
const VIDEO_POSITIONS = new Set(VIDEO_CONFIGS.map((v) => v.pos));

// Spans for each image slot (23 total) computed so every 8-col row is complete
// even when a 4-wide video at pos 10 consumes half a row.
const IMAGE_SPANS: (4 | 8)[] = [
  8, 4, 4, 8,         // before video 0
  8, 4, 4, 8, 8,     // between video 0 and video 1
  4,                   // pairs with video 1 (span 4)
  4, 4, 8, 8,         // after that pair
  8, 4, 4, 8, 8, 4, 4, 8, 8, // after video 2
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
      });
      videoIdx++;
    } else {
      const o = others[imgIdx];
      images.push({
        type: "image",
        src: o.src,
        width: o.width,
        height: o.height,
        gridSpan: IMAGE_SPANS[imgIdx] ?? 8,
      });
      imgIdx++;
    }
  }

  return {
    slug: item.slug,
    client: item.client,
    title: item.title,
    heroImage: img,
    cardImage: img,
    images,
  };
});
