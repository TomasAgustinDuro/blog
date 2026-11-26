import { describe, expect, it } from "vitest";
import {
  idParamSchema,
  paginationQuerySchema,
  postIdParamSchema,
  tagParamSchema,
} from "../../../schemas/requestSchemas.js";

describe("idParamSchema / postIdParamSchema", () => {
  it("converts a numeric text param to a number", () => {
    expect(idParamSchema.parse({ id: "12" })).toEqual({ id: 12 });
    expect(postIdParamSchema.parse({ postId: "3" })).toEqual({ postId: 3 });
  });

  it.each(["abc", "0", "-4", "1.5", "", "2147483648"])("rejects the id %j", (rawId) => {
    const result = idParamSchema.safeParse({ id: rawId });

    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toBe("El id debe ser un número entero positivo");
  });
});

describe("tagParamSchema", () => {
  it("trims the tag", () => {
    expect(tagParamSchema.parse({ tag: " node " })).toEqual({ tag: "node" });
  });

  it("rejects an empty tag", () => {
    expect(tagParamSchema.safeParse({ tag: "  " }).success).toBe(false);
  });
});

describe("paginationQuerySchema", () => {
  it("defaults to page 1", () => {
    expect(paginationQuerySchema.parse({})).toEqual({ page: 1 });
  });

  it("converts the page to a number", () => {
    expect(paginationQuerySchema.parse({ page: "4" })).toEqual({ page: 4 });
  });

  it.each(["abc", "0", "-1", "2.5", "100001"])("rejects the page %j", (rawPage) => {
    const result = paginationQuerySchema.safeParse({ page: rawPage });

    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toMatch(/^La página debe ser un número entero/);
  });
});
