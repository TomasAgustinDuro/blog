import { describe, expect, it, vi } from "vitest";
import * as imageRepository from "../../../repositories/imageRepository.js";
import * as imageService from "../../../services/imageService.js";

vi.mock("../../../repositories/imageRepository.js", () => ({
  insertImage: vi.fn(),
  updateImage: vi.fn(),
  deleteImage: vi.fn(),
}));

const dbImage = {
  id: 2,
  image_url: "https://cdn.test/a.png",
  created_at: new Date("2026-03-01"),
  updated_at: new Date("2026-03-02"),
};

describe("insertImage", () => {
  it("returns the image with a public url field", async () => {
    imageRepository.insertImage.mockResolvedValue(dbImage);

    const result = await imageService.insertImage(dbImage.image_url);

    expect(result.image).toMatchObject({ id: 2, url: "https://cdn.test/a.png" });
  });

  it("throws 404 when the url is missing", async () => {
    await expect(imageService.insertImage("")).rejects.toMatchObject({ status: 404 });
    expect(imageRepository.insertImage).not.toHaveBeenCalled();
  });
});

describe("updateImage", () => {
  it("updates the image url", async () => {
    imageRepository.updateImage.mockResolvedValue(dbImage);

    await imageService.updateImage(2, "https://cdn.test/new.png");

    expect(imageRepository.updateImage).toHaveBeenCalledWith(2, "https://cdn.test/new.png");
  });

  it("throws when id or url are missing", async () => {
    await expect(imageService.updateImage(0, "u")).rejects.toMatchObject({
      message: "ID not found",
    });
    await expect(imageService.updateImage(2, "")).rejects.toMatchObject({
      message: "Data not found",
    });
  });
});

describe("deleteImage", () => {
  it("deletes the image by id", async () => {
    imageRepository.deleteImage.mockResolvedValue(dbImage);

    const result = await imageService.deleteImage(2);

    expect(result.image.id).toBe(2);
  });

  it("lets repository errors bubble up (e.g. record not found)", async () => {
    const notFound = Object.assign(new Error("not found"), { code: "P2025" });
    imageRepository.deleteImage.mockRejectedValue(notFound);

    await expect(imageService.deleteImage(99)).rejects.toMatchObject({ code: "P2025" });
  });
});
