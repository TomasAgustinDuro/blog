import { describe, expect, it } from "vitest";
import { loginSchema } from "../../../schemas/authSchemas.js";
import { commentSchema } from "../../../schemas/commentSchemas.js";
import { imageSchema } from "../../../schemas/imageSchemas.js";
import { POST_TITLE_MAX_LENGTH, postSchema } from "../../../schemas/postSchemas.js";

const firstMessage = (schema, input) => schema.safeParse(input).error?.issues[0].message;

describe("postSchema", () => {
  const validPost = { title: "Hello", content: "<p>Body</p>" };

  it("accepts a minimal post and optional tags and images", () => {
    const result = postSchema.safeParse({ ...validPost, tags: ["node"], images: [{ id: 3 }] });

    expect(result.success).toBe(true);
  });

  it(`accepts titles up to ${POST_TITLE_MAX_LENGTH} characters`, () => {
    const title = "a".repeat(POST_TITLE_MAX_LENGTH);

    expect(postSchema.safeParse({ ...validPost, title }).success).toBe(true);
  });

  it("rejects longer titles with a message that states the limit", () => {
    const title = "a".repeat(POST_TITLE_MAX_LENGTH + 1);

    expect(firstMessage(postSchema, { ...validPost, title })).toBe(
      "El título no puede superar los 100 caracteres"
    );
  });

  it.each([
    [{ content: "x" }, "El título es obligatorio"],
    [{ title: "   ", content: "x" }, "El título es obligatorio"],
    [{ title: 42, content: "x" }, "El título debe ser un texto"],
    [{ title: "T" }, "El contenido es obligatorio"],
  ])("explains what is wrong with %j", (input, message) => {
    expect(firstMessage(postSchema, input)).toBe(message);
  });

  it("explains that the body must be a JSON object", () => {
    expect(firstMessage(postSchema, [])).toMatch(/se espera un objeto JSON/);
  });

  it("trims the title", () => {
    expect(postSchema.parse({ ...validPost, title: "  Hola  " }).title).toBe("Hola");
  });

  it("removes repeated tags and images keeping the order", () => {
    const result = postSchema.parse({
      ...validPost,
      tags: ["node", "react", "node"],
      images: [{ id: 2 }, { id: 1 }, { id: 2 }],
    });

    expect(result.tags).toEqual(["node", "react"]);
    expect(result.images).toEqual([{ id: 2 }, { id: 1 }]);
  });

  it("rejects images without a valid id", () => {
    expect(firstMessage(postSchema, { ...validPost, images: [{}] })).toBe(
      "El id de cada imagen debe ser un número entero positivo"
    );
  });

  it("rejects empty tags", () => {
    expect(firstMessage(postSchema, { ...validPost, tags: [" "] })).toBe(
      "Los tags no pueden estar vacíos"
    );
  });
});

describe("commentSchema", () => {
  it("accepts content up to 255 characters (DB column limit)", () => {
    const result = commentSchema.safeParse({ name: "Ana", content: "a".repeat(255) });

    expect(result.success).toBe(true);
  });

  it("rejects longer content with the limit in the message", () => {
    expect(firstMessage(commentSchema, { name: "Ana", content: "a".repeat(256) })).toBe(
      "El comentario no puede superar los 255 caracteres"
    );
  });

  it("rejects empty or blank name and content", () => {
    expect(firstMessage(commentSchema, { name: " ", content: "hi" })).toBe(
      "El nombre es obligatorio"
    );
    expect(firstMessage(commentSchema, { name: "Ana" })).toBe(
      "El comentario no puede estar vacío"
    );
  });
});

describe("imageSchema", () => {
  it("accepts an https URL", () => {
    expect(imageSchema.safeParse({ image_url: "https://cdn.test/a.png" }).success).toBe(true);
  });

  it.each(["not-a-url", "javascript:alert(1)", "ftp://cdn.test/a.png"])(
    "rejects %j",
    (imageUrl) => {
      expect(firstMessage(imageSchema, { image_url: imageUrl })).toBe(
        "La URL de la imagen no es válida"
      );
    }
  );

  it("asks for the URL when it is missing", () => {
    expect(firstMessage(imageSchema, {})).toBe("Falta la URL de la imagen");
  });
});

describe("loginSchema", () => {
  it("accepts a valid user and password", () => {
    expect(loginSchema.safeParse({ user: "admin", password: "secret1" }).success).toBe(true);
  });

  it("states the real minimum length of the password", () => {
    expect(firstMessage(loginSchema, { user: "admin", password: "123" })).toBe(
      "La contraseña debe tener al menos 6 caracteres"
    );
  });

  it("asks for missing fields", () => {
    expect(firstMessage(loginSchema, { password: "secret1" })).toBe("Ingresá el usuario");
  });
});
