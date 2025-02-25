import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const feedbacks = pgTable("feedbacks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  feedbackId: integer("feedback_id").notNull(),
  userId: integer("user_id").notNull(),
  isUpvote: integer("is_upvote").notNull(), // 1 for upvote, -1 for downvote
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  feedbackId: integer("feedback_id").notNull(),
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reactions = pgTable("reactions", {
  id: serial("id").primaryKey(),
  feedbackId: integer("feedback_id").notNull(),
  userId: integer("user_id").notNull(),
  emoji: text("emoji").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertFeedbackSchema = createInsertSchema(feedbacks)
  .pick({
    title: true,
    description: true,
  })
  .extend({
    title: z.string().min(5).max(100),
    description: z.string().min(20).max(1000),
  });

export const insertCommentSchema = createInsertSchema(comments)
  .pick({
    content: true,
  })
  .extend({
    feedbackId: z.number(),
    content: z.string().min(1).max(500),
  });

export const insertReactionSchema = createInsertSchema(reactions)
  .pick({
    emoji: true,
  })
  .extend({
    feedbackId: z.number(),
    emoji: z.string().min(1).max(2), // Single emoji character or variation selector
  });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Feedback = typeof feedbacks.$inferSelect;
export type Vote = typeof votes.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type Reaction = typeof reactions.$inferSelect;

export type FeedbackWithVotes = Feedback & {
  upvotes: number;
  downvotes: number;
  userVote?: number;
  author: string;
  comments: Comment[];
  reactions: { emoji: string; count: number; userReacted: boolean }[];
};