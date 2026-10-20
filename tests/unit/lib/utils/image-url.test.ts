import {
  buildImageApiUrl,
  IMAGE_API_PREFIX,
  withImageVariant,
} from "@/lib/utils/image-url";

describe("withImageVariant", () => {
  it("retourne null pour une URL absente", () => {
    expect(withImageVariant(null, "thumbnail")).toBeNull();
    expect(withImageVariant(undefined)).toBeNull();
  });

  it("laisse l'URL inchangée sans variante", () => {
    expect(withImageVariant("/api/storage/images/a.jpg")).toBe(
      "/api/storage/images/a.jpg"
    );
  });

  it("insère le suffixe de variante avant l'extension", () => {
    expect(withImageVariant("/img/uploads/photo.png", "thumbnail")).toBe(
      "/img/uploads/photo_thumbnail.png"
    );
    expect(
      withImageVariant(`${IMAGE_API_PREFIX}/2026/avatar.webp`, "medium")
    ).toBe(`${IMAGE_API_PREFIX}/2026/avatar_medium.webp`);
  });
});

describe("buildImageApiUrl", () => {
  it("normalise les séparateurs Windows et retire le slash initial", () => {
    expect(buildImageApiUrl("\\2026\\user\\photo.jpg")).toBe(
      `${IMAGE_API_PREFIX}/2026/user/photo.jpg`
    );
    expect(buildImageApiUrl("/2026/user/photo.jpg")).toBe(
      `${IMAGE_API_PREFIX}/2026/user/photo.jpg`
    );
  });
});
