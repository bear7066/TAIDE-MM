import {
  pgTable,
  text,
  varchar,
  jsonb,
  timestamp,
  pgEnum,
  primaryKey,
  serial,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─────────────── ENUMS ───────────────
export const modalityEnum = pgEnum("modality", ["video", "audio", "image", "text"]);
export const statusEnum = pgEnum("status", ["完成", "進行中", "計劃中", "等待中"]);
export const priorityEnum = pgEnum("priority", ["high", "medium", "low"]);

// ─────────────── DATASETS ───────────────
export const datasets = pgTable("datasets", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name").notNull(),
  modality: modalityEnum("modality").notNull().default("video"),
  status: statusEnum("status").notNull().default("計劃中"),
  source: varchar("source", { length: 64 }).notNull().default("—"),
  samples: varchar("samples", { length: 32 }).default("—"),
  baseModel: varchar("base_model", { length: 128 }).default("—"),
  description: text("description").notNull().default(""),
  url: text("url"),
  updatedAt: varchar("updated_at", { length: 16 }).default("—"),
  // 內建 tag (string array)
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  assignees: jsonb("assignees").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  // 編輯者紀錄
  createdBy: varchar("created_by", { length: 64 }),
});

// ─────────────── MODELS ───────────────
export const models = pgTable("models", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name").notNull(),
  status: statusEnum("status").notNull().default("計劃中"),
  modality: modalityEnum("modality").notNull().default("video"),
  baseModel: varchar("base_model", { length: 128 }).default("—"),
  params: varchar("params", { length: 32 }).default("—"),
  precision: varchar("precision", { length: 16 }).default("—"),
  stage: varchar("stage", { length: 32 }).default("—"),
  finalLoss: varchar("final_loss", { length: 16 }).default("—"),
  steps: varchar("steps", { length: 16 }).default("—"),
  trainData: varchar("train_data", { length: 128 }).default("—"),
  hardware: varchar("hardware", { length: 128 }).default("—"),
  description: text("description").notNull().default(""),
  url: text("url"),
  downloads: varchar("downloads", { length: 16 }).default("0"),
  // Loss 曲線:[[step, loss], ...]
  lossHistory: jsonb("loss_history").$type<number[]>().notNull().default([]),
  lossSteps: jsonb("loss_steps").$type<number[]>().notNull().default([]),
  updatedAt: varchar("updated_at", { length: 16 }).default("—"),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  assignees: jsonb("assignees").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: varchar("created_by", { length: 64 }),
});

// ─────────────── TASKS ───────────────
export const tasks = pgTable("tasks", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name").notNull(),
  status: statusEnum("status").notNull().default("計劃中"),
  description: text("description").notNull().default(""),
  // 連結到 datasets/models 的 id 陣列
  linkedDatasets: jsonb("linked_datasets").$type<string[]>().notNull().default([]),
  linkedModels: jsonb("linked_models").$type<string[]>().notNull().default([]),
  priority: priorityEnum("priority").notNull().default("medium"),
  updatedAt: varchar("updated_at", { length: 16 }).default("—"),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  assignees: jsonb("assignees").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: varchar("created_by", { length: 64 }),
});

// ─────────────── BENCHMARKS ───────────────
export const evals = pgTable("evals", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name").notNull(),
  status: statusEnum("status").notNull().default("計劃中"),
  description: text("description").notNull().default(""),
  // 連結到 datasets/models 的 id 陣列
  linkedDatasets: jsonb("linked_datasets").$type<string[]>().notNull().default([]),
  linkedModels: jsonb("linked_models").$type<string[]>().notNull().default([]),
  // 多筆指標: [{ name: "BLEU", value: "0.412" }, ...]
  metrics: jsonb("metrics").$type<{ name: string; value: string }[]>().notNull().default([]),
  url: text("url"),
  updatedAt: varchar("updated_at", { length: 16 }).default("—"),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  assignees: jsonb("assignees").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: varchar("created_by", { length: 64 }),
});

// ─────────────── DISCUSSIONS ───────────────
export const discussions = pgTable("discussions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull().default(""),
  status: statusEnum("status").notNull().default("進行中"),
  // 可連結到 datasets / models / tasks
  linkedDatasets: jsonb("linked_datasets").$type<string[]>().notNull().default([]),
  linkedModels: jsonb("linked_models").$type<string[]>().notNull().default([]),
  linkedTasks: jsonb("linked_tasks").$type<string[]>().notNull().default([]),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  assignees: jsonb("assignees").$type<string[]>().notNull().default([]),
  comments: jsonb("comments").$type<DiscussionComment[]>().notNull().default([]),
  updatedAt: varchar("updated_at", { length: 16 }).default("—"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: varchar("created_by", { length: 64 }),
});

// ─────────────── 全域 TAG 字典 ───────────────
// 存所有曾用過的 tag,新增項目時可以下拉選擇/自動完成
export const globalTags = pgTable("global_tags", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 64 }).notNull().unique(),
  // 可選顏色 (顯示用)
  color: varchar("color", { length: 16 }),
  // 該 tag 用過幾次 (排序用)
  usageCount: serial("usage_count"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─────────────── PIPELINE IMAGES ───────────────
export const pipelineImages = pgTable("pipeline_images", {
  id: varchar("id", { length: 64 }).primaryKey(),
  // 'preprocessing' | 'training' | 'benchmark'
  category: varchar("category", { length: 32 }).notNull(),
  title: text("title").default(""),
  imageUrl: text("image_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: varchar("created_by", { length: 64 }),
});

// ─────────────── NOTES ───────────────
export const notes = pgTable("notes", {
  id: text("id").primaryKey(),
  content: text("content").notNull().default(""),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  updatedBy: text("updated_by"),
});

// ─────────────── TYPE EXPORTS ───────────────
// For selecting/inserting database's schema, e.g. SELECT * FROM ... 
export type Dataset = typeof datasets.$inferSelect;
export type NewDataset = typeof datasets.$inferInsert;
export type Model = typeof models.$inferSelect;
export type NewModel = typeof models.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type Eval = typeof evals.$inferSelect;
export type NewEval = typeof evals.$inferInsert;
export type Benchmark = Eval;
export type NewBenchmark = NewEval;
export type DiscussionComment = {
  id: string;
  author: string;
  body: string;
  createdAt: string;
};
export type Discussion = typeof discussions.$inferSelect;
export type NewDiscussion = typeof discussions.$inferInsert;
export type GlobalTag = typeof globalTags.$inferSelect;
export type PipelineImage = typeof pipelineImages.$inferSelect;
export type NewPipelineImage = typeof pipelineImages.$inferInsert;
