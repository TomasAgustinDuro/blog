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
  it("returns a single level { comment } object", async () => {
    commentRepository.getSpecificComment.mockResolvedValue(dbComment);

    const result = await commentService.getSpecificComment(5);

    expect(result).toEqual({ comment: expect.objectContaining({ id: 5 }) });
  });

  it("throws 404 when the comment does not exist", async () => {
    commentRepository.getSpecificComment.mockResolvedValue(null);

    await expect(commentService.getSpecificComment(9)).rejects.toMatchObject({
      status: 404,
      message: "El comentario no existe",
    });
  });

  it("rejects a missing id with a 400", async () => {
    await expect(commentService.getSpecificComment(0)).rejects.toMatchObject({
      status: 400,
    });
  });
});

describe("insertComment / deleteComment", () => {
  it("inserts a comment and returns it mapped", async () => {
    commentRepository.insertComment.mockResolvedValue(dbComment);

    const result = await commentService.insertComment({ name: "Ana", content: "x", postId: 1 });

    expect(result.comment.id).toBe(5);
  });

  it("rejects missing data with a 400", async () => {
    await expect(commentService.insertComment(undefined)).rejects.toMatchObject({
      status: 400,
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
