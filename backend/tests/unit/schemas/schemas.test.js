import { describe, expect, it } from "vitest";
import { loginSchema } from "../../../schemas/authSchemas.js";
import { commentSchema } from "../../../schemas/commentSchemas.js";
import { imageSchema } from "../../../schemas/imageSchemas.js";
import { postSchema } from "../../../schemas/postSchemas.js";

describe("postSchema", () => {
  const validPost = { title: "Hello", content: "<p>Body</p>" };

  it("accepts a minimal post and optional tags and images", () => {
    const result = postSchema.safeParse({
      ...validPost,
      tags: ["node"],
      images: [{ id: 3 }],
    });

    expect(result.success).toBe(true);
  });

  it("rejects an empty title", () => {
    expect(postSchema.safeParse({ ...validPost, title: "" }).success).toBe(false);
  });

  it("rejects titles longer than 50 characters", () => {
    const longTitle = "a".repeat(51);

    expect(postSchema.safeParse({ ...validPost, title: longTitle }).success).toBe(false);
  });

  it("rejects images with a non positive id", () => {
    const result = postSchema.safeParse({ ...validPost, images: [{ id: 0 }] });

    expect(result.success).toBe(false);
  });

  it("rejects non-string tags", () => {
    expect(postSchema.safeParse({ ...validPost, tags: [1] }).success).toBe(false);
  });
});

describe("commentSchema", () => {
  it("accepts content up to 255 characters (DB column limit)", () => {
    const result = commentSchema.safeParse({ name: "Ana", content: "a".repeat(255) });

    expect(result.success).toBe(true);
  });

  it("rejects content over 255 characters", () => {
    const result = commentSchema.safeParse({ name: "Ana", content: "a".repeat(256) });

    expect(result.success).toBe(false);
  });

  it("rejects empty name or content", () => {
    expect(commentSchema.safeParse({ name: "", content: "hi" }).success).toBe(false);
    expect(commentSchema.safeParse({ name: "Ana", content: "" }).success).toBe(false);
  });
});

describe("imageSchema", () => {
  it("accepts a valid URL", () => {
    expect(imageSchema.safeParse({ image_url: "https://cdn.test/a.png" }).success).toBe(true);
  });

  it("rejects text that is not a URL", () => {
    expect(imageSchema.safeParse({ image_url: "not-a-url" }).success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts a valid user and password", () => {
    expect(loginSchema.safeParse({ user: "admin", password: "secret1" }).success).toBe(true);
  });

  it("rejects short users, short passwords and missing fields", () => {
    expect(loginSchema.safeParse({ user: "ab", password: "secret1" }).success).toBe(false);
    expect(loginSchema.safeParse({ user: "admin", password: "123" }).success).toBe(false);
    expect(loginSchema.safeParse({}).success).toBe(false);
  });
});
