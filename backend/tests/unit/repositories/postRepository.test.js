import { beforeEach, describe, expect, it, vi } from "vitest";
import { updatedPost } from "../../../repositories/postRepository.js";

// Cliente de transacción falso: cada tabla expone los métodos que usa updatedPost
const transactionClient = vi.hoisted(() => ({
  posts: { update: vi.fn(), findUnique: vi.fn() },
  tags: { upsert: vi.fn() },
  post_tags: { deleteMany: vi.fn(), create: vi.fn() },
  post_images: { deleteMany: vi.fn(), create: vi.fn() },
}));

vi.mock("../../../lib/prisma.js", () => ({
  prisma: { $transaction: (callback) => callback(transactionClient) },
}));

beforeEach(() => {
  transactionClient.posts.update.mockResolvedValue({ id: 1 });
  transactionClient.posts.findUnique.mockResolvedValue({ id: 1 });
  transactionClient.tags.upsert.mockImplementation(({ create }) => ({ id: 9, ...create }));
});

describe("updatedPost", () => {
  it("keeps tags and images when they are not sent", async () => {
    await updatedPost(1, { title: "T", content: "C" });

    expect(transactionClient.post_tags.deleteMany).not.toHaveBeenCalled();
    expect(transactionClient.post_images.deleteMany).not.toHaveBeenCalled();
  });

  it("replaces images when a list is sent, marking the first as featured", async () => {
    await updatedPost(1, { title: "T", content: "C", images: [{ id: 4 }, { id: 6 }] });

    expect(transactionClient.post_images.deleteMany).toHaveBeenCalledWith({
      where: { post_id: 1 },
    });
    expect(transactionClient.post_images.create.mock.calls.map(([args]) => args.data)).toEqual([
      { post_id: 1, image_id: 4, is_featured: true, order: 0 },
      { post_id: 1, image_id: 6, is_featured: false, order: 1 },
    ]);
  });

  it("removes every tag when an empty list is sent", async () => {
    await updatedPost(1, { title: "T", content: "C", tags: [] });

    expect(transactionClient.post_tags.deleteMany).toHaveBeenCalledOnce();
    expect(transactionClient.post_tags.create).not.toHaveBeenCalled();
  });

  it("upserts each tag and links it to the post", async () => {
    await updatedPost(1, { title: "T", content: "C", tags: ["node"] });

    expect(transactionClient.tags.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { name: "node" } })
    );
    expect(transactionClient.post_tags.create).toHaveBeenCalledWith({
      data: { post_id: 1, tag_id: 9 },
    });
  });
});
