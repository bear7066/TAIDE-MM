/**
 * Seed script - 把原 dashboard.html 寫死的資料塞進 Postgres
 * 使用: pnpm db:seed (或 npm run db:seed)
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { datasets, models, tasks, globalTags } from "../lib/schema";
import { sql } from "drizzle-orm";

const DATASETS = [
  {
    id: "kinetics-40k",
    name: "gemma-4-e4b-kinetics_40K",
    modality: "video" as const,
    status: "完成" as const,
    source: "Kinetics",
    samples: "40K",
    baseModel: "Gemma 4 E4B",
    description: "大規模 Kinetics 動作辨識資料集，含 40K 影片–動作對應樣本，使用 Gemma 4 E4B 生成語意標注，適用於影像語言對齊預訓練。",
    url: "https://huggingface.co/datasets/bear7011/gemma-4-e4b-kinetics_40K",
    tags: ["kinetics-400", "action-recognition", "video-text-pair", "gemma-4"],
    updatedAt: "2025-04",
  },
  {
    id: "kinetics-3k",
    name: "gemma-3-4b-kinetics_3K",
    modality: "video" as const,
    status: "完成" as const,
    source: "Kinetics",
    samples: "3,115",
    baseModel: "Gemma 3 4B",
    description: "Kinetics 影片動作辨識子集，含 3,115 精選影片–文字配對，作為 Gemma 3 4B Stage 1 視覺對齊訓練的核心資料集。",
    url: "https://huggingface.co/datasets/bear7011/gemma-3-4b-kinetics_3K",
    tags: ["kinetics-400/600/700", "action-recognition", "stage1", "gemma-3"],
    updatedAt: "2025-03",
  },
  {
    id: "webvid-4k",
    name: "gemma-4-e4b-webvid-4K",
    modality: "video" as const,
    status: "完成" as const,
    source: "WebVid",
    samples: "3,941",
    baseModel: "GPT-4o",
    description: "基於 WebVid 來源的動作辨識資料集，3,941 個樣本透過 GPT-4o 重新標注動作語義，強化多樣化場景理解能力。",
    url: "https://huggingface.co/datasets/bear7011/gemma-4-e4b-webvid-4K",
    tags: ["webvid", "gpt-4o-labels", "action-recognition", "gemma-4"],
    updatedAt: "2025-04",
  },
  {
    id: "audio-placeholder",
    name: "taide-audio-zh_TW",
    modality: "audio" as const,
    status: "計劃中" as const,
    source: "—",
    samples: "—",
    baseModel: "—",
    description: "中文語音理解資料集（規劃中），目標蒐集台灣中文語音–文字配對，用於音訊語言模型訓練。",
    url: null,
    tags: ["audio", "zh-tw", "speech", "planned"],
    updatedAt: "—",
  },
];

const MODELS = [
  {
    id: "gemma3-ft",
    name: "gemma3-4b-kinetic3K_FT",
    status: "完成" as const,
    modality: "video" as const,
    baseModel: "google/gemma-3-4b-it",
    params: "5B",
    precision: "BF16",
    stage: "Stage 1",
    finalLoss: "3.04",
    steps: "390",
    trainData: "gemma-3-4b-kinetics_3K",
    hardware: "1× GPU · ~2.4 hrs",
    description: "Gemma 3 4B-IT 的 Stage 1 視覺對齊微調版本，凍結 LLM 主幹，僅訓練視覺編碼器與投影器，為後續 Stage 2 指令微調奠定基礎。",
    url: "https://huggingface.co/bear7011/gemma3-4b-kinetic3K_FT",
    tags: ["video-text-to-text", "safetensors", "deepspeed-zero2", "stage1"],
    downloads: "63",
    lossHistory: [6.33, 5.80, 4.52, 3.30, 3.04, 3.04],
    lossSteps: [10, 50, 100, 200, 300, 390],
    updatedAt: "2025-03",
  },
];

const TASKS = [
  {
    id: "t1", name: "Stage 1 視覺對齊訓練",
    status: "完成" as const,
    description: "使用 Kinetics 3K 資料集對 Gemma 3 4B 進行視覺編碼器與投影器對齊訓練，已完成並發布模型。",
    linkedDatasets: ["kinetics-3k"], linkedModels: ["gemma3-ft"],
    priority: "high" as const, updatedAt: "2025-03", tags: [],
  },
  {
    id: "t2", name: "Kinetics 40K 大規模資料標注",
    status: "完成" as const,
    description: "使用 Gemma 4 E4B 對 Kinetics 40K 影片進行語意標注與配對，資料集已上傳 HuggingFace。",
    linkedDatasets: ["kinetics-40k"], linkedModels: [],
    priority: "high" as const, updatedAt: "2025-04", tags: [],
  },
  {
    id: "t3", name: "WebVid 資料蒐集與標注",
    status: "完成" as const,
    description: "從 WebVid 蒐集影片，使用 GPT-4o 重新標注動作語義，強化場景多樣性。",
    linkedDatasets: ["webvid-4k"], linkedModels: [],
    priority: "medium" as const, updatedAt: "2025-04", tags: [],
  },
  {
    id: "t4", name: "Stage 2 指令微調",
    status: "進行中" as const,
    description: "在 Stage 1 模型基礎上進行指令跟隨微調，整合 Kinetics 40K + WebVid 4K 資料集，目標提升中文指令理解能力。",
    linkedDatasets: ["kinetics-40k", "webvid-4k"], linkedModels: ["gemma3-ft"],
    priority: "high" as const, updatedAt: "2025-05", tags: [],
  },
  {
    id: "t5", name: "Audio 資料集蒐集",
    status: "等待中" as const,
    description: "規劃蒐集台灣中文語音資料集，用於音訊語言模型訓練，目前尚未啟動。",
    linkedDatasets: ["audio-placeholder"], linkedModels: [],
    priority: "low" as const, updatedAt: "—", tags: [],
  },
];

async function main() {
  console.log("🌱 開始 seed 資料...");

  const { db } = await import("../lib/db");

  // 清空既有資料 (小心使用!)
  console.log("  清空舊資料...");
  await db.delete(tasks);
  await db.delete(models);
  await db.delete(datasets);
  await db.delete(globalTags);

  console.log(`  插入 ${DATASETS.length} 筆 datasets...`);
  await db.insert(datasets).values(DATASETS);

  console.log(`  插入 ${MODELS.length} 筆 models...`);
  await db.insert(models).values(MODELS);

  console.log(`  插入 ${TASKS.length} 筆 tasks...`);
  await db.insert(tasks).values(TASKS);

  // 收集所有 tags 到全域字典
  const allTags = new Set<string>();
  DATASETS.forEach(d => d.tags.forEach(t => allTags.add(t)));
  MODELS.forEach(m => m.tags.forEach(t => allTags.add(t)));

  if (allTags.size > 0) {
    console.log(`  寫入 ${allTags.size} 個 global tags...`);
    await db.insert(globalTags).values(
      Array.from(allTags).map(name => ({ name }))
    );
  }

  console.log("✅ Seed 完成!");
  process.exit(0);
}

main().catch(e => {
  console.error("❌ Seed 失敗:", e);
  process.exit(1);
});
