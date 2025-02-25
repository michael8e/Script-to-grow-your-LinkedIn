import { InsertUser, User, Feedback, Vote, Comment, Reaction, FeedbackWithVotes } from "@shared/schema";
import session from "express-session";
import { users, feedbacks, votes, comments, reactions } from "@shared/schema";
import { eq, and, desc, or, like, sql } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import { db, pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  createFeedback(feedback: Omit<Feedback, "id" | "createdAt">): Promise<Feedback>;
  getFeedback(id: number): Promise<FeedbackWithVotes | undefined>;
  getFeedbacks(search?: string): Promise<FeedbackWithVotes[]>;
  deleteFeedback(id: number): Promise<void>;

  createVote(vote: Omit<Vote, "id">): Promise<Vote>;
  getVote(feedbackId: number, userId: number): Promise<Vote | undefined>;
  updateVote(id: number, isUpvote: number): Promise<Vote>;

  createComment(comment: Omit<Comment, "id" | "createdAt">): Promise<Comment>;
  getComments(feedbackId: number): Promise<Comment[]>;

  // New methods for reactions
  createReaction(reaction: Omit<Reaction, "id" | "createdAt">): Promise<Reaction>;
  getReactions(feedbackId: number, userId?: number): Promise<{ emoji: string; count: number; userReacted: boolean }[]>;
  deleteReaction(feedbackId: number, userId: number, emoji: string): Promise<void>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      conObject: {
        connectionString: process.env.DATABASE_URL,
      },
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.id, id));
    return results[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.username, username));
    return results[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createFeedback(feedback: Omit<Feedback, "id" | "createdAt">): Promise<Feedback> {
    const [newFeedback] = await db.insert(feedbacks).values(feedback).returning();
    return newFeedback;
  }

  async getFeedback(id: number): Promise<FeedbackWithVotes | undefined> {
    const results = await db.select().from(feedbacks).where(eq(feedbacks.id, id));
    if (!results.length) return undefined;

    const feedback = results[0];
    const feedbackVotes = await db.select().from(votes).where(eq(votes.feedbackId, id));
    const feedbackComments = await this.getComments(id);
    const author = (await this.getUser(feedback.userId))?.username || 'Unknown';
    const feedbackReactions = await this.getReactions(id);

    return {
      ...feedback,
      upvotes: feedbackVotes.filter(v => v.isUpvote === 1).length,
      downvotes: feedbackVotes.filter(v => v.isUpvote === -1).length,
      author,
      comments: feedbackComments,
      reactions: feedbackReactions,
    };
  }

  async getFeedbacks(search?: string): Promise<FeedbackWithVotes[]> {
    let query = db.select().from(feedbacks);

    if (search) {
      query = query.where(
        or(
          like(feedbacks.title, `%${search}%`),
          like(feedbacks.description, `%${search}%`)
        )
      );
    }

    const results = await query;
    return Promise.all(results.map(f => this.getFeedback(f.id) as Promise<FeedbackWithVotes>));
  }

  async deleteFeedback(id: number): Promise<void> {
    await db.delete(feedbacks).where(eq(feedbacks.id, id));
  }

  async createVote(vote: Omit<Vote, "id">): Promise<Vote> {
    const [newVote] = await db.insert(votes).values(vote).returning();
    return newVote;
  }

  async getVote(feedbackId: number, userId: number): Promise<Vote | undefined> {
    const results = await db
      .select()
      .from(votes)
      .where(
        and(
          eq(votes.feedbackId, feedbackId),
          eq(votes.userId, userId)
        )
      );
    return results[0];
  }

  async updateVote(id: number, isUpvote: number): Promise<Vote> {
    const [updatedVote] = await db
      .update(votes)
      .set({ isUpvote })
      .where(eq(votes.id, id))
      .returning();
    return updatedVote;
  }

  async createComment(comment: Omit<Comment, "id" | "createdAt">): Promise<Comment> {
    const [newComment] = await db.insert(comments).values(comment).returning();
    return newComment;
  }

  async getComments(feedbackId: number): Promise<Comment[]> {
    return db
      .select()
      .from(comments)
      .where(eq(comments.feedbackId, feedbackId))
      .orderBy(desc(comments.createdAt));
  }

  // New methods for reactions
  async createReaction(reaction: Omit<Reaction, "id" | "createdAt">): Promise<Reaction> {
    // Delete existing reaction if it exists
    await db.delete(reactions)
      .where(and(
        eq(reactions.feedbackId, reaction.feedbackId),
        eq(reactions.userId, reaction.userId),
        eq(reactions.emoji, reaction.emoji)
      ));

    const [newReaction] = await db.insert(reactions).values(reaction).returning();
    return newReaction;
  }

  async getReactions(feedbackId: number, userId?: number): Promise<{ emoji: string; count: number; userReacted: boolean }[]> {
    const reactionCounts = await db
      .select({
        emoji: reactions.emoji,
        count: sql<number>`count(*)::int`,
        userReacted: sql<boolean>`bool_or(${reactions.userId} = ${userId || 0})`,
      })
      .from(reactions)
      .where(eq(reactions.feedbackId, feedbackId))
      .groupBy(reactions.emoji);

    return reactionCounts;
  }

  async deleteReaction(feedbackId: number, userId: number, emoji: string): Promise<void> {
    await db.delete(reactions)
      .where(and(
        eq(reactions.feedbackId, feedbackId),
        eq(reactions.userId, userId),
        eq(reactions.emoji, emoji)
      ));
  }

  sessionStore: session.Store;
}

export const storage = new DatabaseStorage();