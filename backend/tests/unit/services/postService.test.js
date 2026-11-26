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

const expectHttpError = async (promise, status, message) => {
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

    const result = await postService.getSpecificPost(1);

    expect(postRepository.findByPk).toHaveBeenCalledWith(1);
    expect(result.post.title).toBe("Title");
  });

  it("throws 404 when the post does not exist", async () => {
    postRepository.findByPk.mockResolvedValue(null);

    await expectHttpError(postService.getSpecificPost(99), 404, "El post no existe");
  });

  it("rejects a missing id with a 400", async () => {
    await expectHttpError(postService.getSpecificPost(undefined), 400, "Falta el id del post");
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

    expect((await postService.getByTag("unknown")).posts).toEqual([]);
  });

  it("rejects an empty tag with a 400", async () => {
    await expectHttpError(postService.getByTag(""), 400, "Falta el nombre del tag");
  });
});

describe("createPost / updatePost / deletePost", () => {
  it("creates a post and returns it mapped", async () => {
    postRepository.createPost.mockResolvedValue(buildDbPost());

    const result = await postService.createPost({ title: "Title", content: "x" });

    expect(result.post.id).toBe(1);
  });

  it("rejects createPost without data", async () => {
    await expectHttpError(postService.createPost(undefined), 400, "Faltan los datos del post");
  });

  it("passes undefined tags and images through so they are kept", async () => {
    postRepository.updatedPost.mockResolvedValue(buildDbPost({ title: "New" }));
    const changes = { title: "New", content: "x", tags: undefined, images: undefined };

    const result = await postService.updatePost(1, changes);

    expect(postRepository.updatedPost).toHaveBeenCalledWith(1, changes);
    expect(result.post.title).toBe("New");
  });

  it("rejects updates without id or data", async () => {
    await expectHttpError(postService.updatePost(undefined, {}), 400, "Falta el id del post");
    await expectHttpError(postService.updatePost(1, undefined), 400, "Faltan los datos del post");
  });

  it("deletes a post and returns the removed one", async () => {
    postRepository.deletePost.mockResolvedValue(buildDbPost({ post_tags: undefined }));

    const result = await postService.deletePost(1);

    expect(result.post.postTags).toEqual([]);
  });

  it("lets repository errors bubble up (e.g. P2025 when the post does not exist)", async () => {
    postRepository.deletePost.mockRejectedValue(Object.assign(new Error("x"), { code: "P2025" }));

    await expect(postService.deletePost(1)).rejects.toMatchObject({ code: "P2025" });
  });
});
