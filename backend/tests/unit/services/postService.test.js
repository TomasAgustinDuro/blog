import { beforeEach, describe, expect, it, vi } from "vitest";
import * as postRepository from "../../../repositories/postRepository.js";
import * as postService from "../../../services/postService.js";

vi.mock("../../../repositories/postRepository.js", () => ({
  findAllPaginated: vi.fn(),
  countAll: vi.fn(),
  findByPk: vi.fn(),
  findByTag: vi.fn(),
  createPost: vi.fn(),
  updatedPost: vi.fn(),
  deletePost: vi.fn(),
}));

const buildDbPost = (overrides = {}) => ({
  id: 1,
  title: "Title",
  content: "<p>Body</p>",
  date: new Date("2026-01-01"),
  post_tags: [{ tags: { id: 7, name: "node" } }],
  comments: [{ id: 1 }, { id: 2 }],
  ...overrides,
});

const expectStatus = async (promise, status, message) => {
  await expect(promise).rejects.toMatchObject({ status, message });
};

describe("getAllPost", () => {
  beforeEach(() => {
    postRepository.findAllPaginated.mockResolvedValue([buildDbPost()]);
    postRepository.countAll.mockResolvedValue(25);
  });

  it("computes the offset from page and limit", async () => {
    await postService.getAllPost(3, 10);

    expect(postRepository.findAllPaginated).toHaveBeenCalledWith(20, 10);
  });

  it("returns mapped posts and pagination data", async () => {
    const result = await postService.getAllPost(1, 10);

    expect(result.pagination).toEqual({
      currentPage: 1,
      totalPages: 3,
      totalPosts: 25,
      perPage: 10,
    });
    expect(result.posts[0]).toMatchObject({
      id: 1,
      postTags: [{ id: 7, name: "node" }],
      commentsCount: 2,
    });
  });

  it("returns an empty list when there are no posts", async () => {
    postRepository.findAllPaginated.mockResolvedValue([]);
    postRepository.countAll.mockResolvedValue(0);

    const result = await postService.getAllPost(1, 10);

    expect(result.posts).toEqual([]);
    expect(result.pagination.totalPages).toBe(0);
  });
});

describe("getSpecificPost", () => {
  it("returns the mapped post when it exists", async () => {
    postRepository.findByPk.mockResolvedValue(buildDbPost());

    const result = await postService.getSpecificPost("1");

    expect(postRepository.findByPk).toHaveBeenCalledWith(1);
    expect(result.post.title).toBe("Title");
  });

  it("throws 404 when the post does not exist", async () => {
    postRepository.findByPk.mockResolvedValue(null);

    await expectStatus(postService.getSpecificPost("99"), 404, "Post not found");
  });

  it("throws 404 when no id is provided", async () => {
    await expectStatus(postService.getSpecificPost(undefined), 404, "ID not found");
  });
});

describe("getByTag", () => {
  it("returns posts for the tag using pagination", async () => {
    postRepository.findByTag.mockResolvedValue([buildDbPost()]);

    const result = await postService.getByTag("node", 2, 10);

    expect(postRepository.findByTag).toHaveBeenCalledWith("node", 10, 10);
    expect(result.posts).toHaveLength(1);
  });

  it("returns an empty list when no post has the tag", async () => {
    postRepository.findByTag.mockResolvedValue([]);

    const result = await postService.getByTag("unknown");

    expect(result.posts).toEqual([]);
  });

  it("throws 404 when the tag is empty", async () => {
    await expectStatus(postService.getByTag(""), 404, "Tag not found");
  });
});

describe("createPost / updatePost / deletePost", () => {
  it("creates a post and returns it mapped", async () => {
    postRepository.createPost.mockResolvedValue(buildDbPost());

    const result = await postService.createPost({ title: "Title", content: "x" });

    expect(result.post.id).toBe(1);
  });

  it("throws when creation returns nothing", async () => {
    postRepository.createPost.mockResolvedValue(null);

    await expectStatus(postService.createPost({ title: "T" }), 404, "Something was wrong");
  });

  it("throws when createPost receives no data", async () => {
    await expectStatus(postService.createPost(undefined), 404, "Data not found");
  });

  it("updates a post through the repository", async () => {
    postRepository.updatedPost.mockResolvedValue(buildDbPost({ title: "New" }));

    const result = await postService.updatePost(1, { title: "New" });

    expect(postRepository.updatedPost).toHaveBeenCalledWith(1, { title: "New" });
    expect(result.post.title).toBe("New");
  });

  it("throws when updating without id or data", async () => {
    await expectStatus(postService.updatePost(undefined, {}), 404, "ID not found");
    await expectStatus(postService.updatePost(1, undefined), 404, "Data not found");
  });

  it("deletes a post and returns the removed one", async () => {
    postRepository.deletePost.mockResolvedValue(buildDbPost({ post_tags: undefined }));

    const result = await postService.deletePost("1");

    expect(result.post.postTags).toEqual([]);
  });

  it("lets repository errors bubble up", async () => {
    postRepository.deletePost.mockRejectedValue(new Error("db down"));

    await expect(postService.deletePost("1")).rejects.toThrow("db down");
  });
});
