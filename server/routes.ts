import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertFeedbackSchema, insertCommentSchema, insertReactionSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.get("/api/feedbacks", async (req, res) => {
    const search = req.query.search as string | undefined;
    const feedbacks = await storage.getFeedbacks(search);
    res.json(feedbacks);
  });

  app.post("/api/feedbacks", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const result = insertFeedbackSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json(result.error);
    }

    const feedback = await storage.createFeedback({
      ...result.data,
      userId: req.user!.id,
    });

    res.status(201).json(feedback);
  });

  app.delete("/api/feedbacks/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const feedback = await storage.getFeedback(Number(req.params.id));
    if (!feedback) return res.sendStatus(404);
    if (feedback.userId !== req.user!.id) return res.sendStatus(403);

    await storage.deleteFeedback(Number(req.params.id));
    res.sendStatus(204);
  });

  app.post("/api/feedbacks/:id/vote", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const feedbackId = Number(req.params.id);
    const { isUpvote } = req.body;
    if (typeof isUpvote !== "number" || ![1, -1].includes(isUpvote)) {
      return res.status(400).json({ message: "Invalid vote value" });
    }

    const existingVote = await storage.getVote(feedbackId, req.user!.id);
    if (existingVote) {
      const vote = await storage.updateVote(existingVote.id, isUpvote);
      return res.json(vote);
    }

    const vote = await storage.createVote({
      feedbackId,
      userId: req.user!.id,
      isUpvote,
    });

    res.status(201).json(vote);
  });

  app.post("/api/feedbacks/:id/comments", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const result = insertCommentSchema.safeParse({
      ...req.body,
      feedbackId: Number(req.params.id),
    });
    if (!result.success) {
      return res.status(400).json(result.error);
    }

    const comment = await storage.createComment({
      ...result.data,
      userId: req.user!.id,
    });

    res.status(201).json(comment);
  });

  // New routes for emoji reactions
  app.post("/api/feedbacks/:id/reactions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const result = insertReactionSchema.safeParse({
      ...req.body,
      feedbackId: Number(req.params.id),
    });
    if (!result.success) {
      return res.status(400).json(result.error);
    }

    const reaction = await storage.createReaction({
      ...result.data,
      feedbackId: Number(req.params.id),
      userId: req.user!.id,
    });

    res.status(201).json(reaction);
  });

  app.delete("/api/feedbacks/:id/reactions/:emoji", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    await storage.deleteReaction(
      Number(req.params.id),
      req.user!.id,
      req.params.emoji
    );

    res.sendStatus(204);
  });

  const httpServer = createServer(app);
  return httpServer;
}