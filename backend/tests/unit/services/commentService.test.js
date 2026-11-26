import { describe, expect, it, vi } from "vitest";
import * as commentRepository from "../../../repositories/commentRepository.js";
import * as commentService from "../../../services/commentService.js";

vi.mock("../../../repositories/commentRepository.js", () => ({
  findAllPaginated: vi.fn(),
  getSpecificComment: vi.fn(),
  insertComment: vi.fn(),
  deleteComment: vi.fn(),
}));

const dbComment = {
  id: 5,
  name: "Ana",
  content: "Nice post",
  date: new Date("2026-02-01"),
  post_id: 1,
};

describe("getAllComments", () => {
  it("computes the offset and maps only public fields", async () => {
    commentRepository.findAllPaginated.mockResolvedValue([dbComment]);

    const result = await commentService.getAllComments(2, 100);

    expect(commentRepository.findAllPaginated).toHaveBeenCalledWith(100, 100);
    expect(result.comments[0]).toEqual({
      id: 5,
      name: "Ana",
      content: "Nice post",
      date: dbComment.date,
    });
  });
});

describe("getSpecificComment", () => {
  it("throws 404 when the comment does not exist", async () => {
    commentRepository.getSpecificComment.mockResolvedValue(null);

    await expect(commentService.getSpecificComment(9)).rejects.toMatchObject({
      status: 404,
    });
  });

  it("throws 404 when no id is provided", async () => {
    await expect(commentService.getSpecificComment(0)).rejects.toMatchObject({
      message: "ID not found",
    });
  });
});

describe("insertComment / deleteComment", () => {
  it("inserts a comment and returns it mapped", async () => {
    commentRepository.insertComment.mockResolvedValue(dbComment);

    const result = await commentService.insertComment({ name: "Ana", content: "x" });

    expect(result.comment.id).toBe(5);
  });

  it("throws when no data is provided", async () => {
    await expect(commentService.insertComment(undefined)).rejects.toMatchObject({
      status: 404,
    });
  });

  it("deletes a comment by id", async () => {
    commentRepository.deleteComment.mockResolvedValue(dbComment);

    const result = await commentService.deleteComment(5);

    expect(commentRepository.deleteComment).toHaveBeenCalledWith(5);
    expect(result.comment.name).toBe("Ana");
  });

  it("lets repository errors bubble up", async () => {
    commentRepository.deleteComment.mockRejectedValue(new Error("db down"));

    await expect(commentService.deleteComment(5)).rejects.toThrow("db down");
  });
});
