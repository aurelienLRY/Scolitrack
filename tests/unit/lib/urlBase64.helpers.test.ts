import { urlBase64ToUint8Array } from "@/lib/urlBase64.helpers";

describe("urlBase64ToUint8Array", () => {
  it("décode une chaîne base64 url-safe sans padding", () => {
    const bytes = urlBase64ToUint8Array("aGVsbG8");

    expect(new TextDecoder().decode(bytes)).toBe("hello");
  });

  it("accepte les caractères url-safe à la place de + et /", () => {
    const source = Buffer.from([0xfb, 0xff, 0xef]);
    const urlSafe = source
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    expect(Array.from(urlBase64ToUint8Array(urlSafe))).toEqual([
      0xfb, 0xff, 0xef,
    ]);
  });
});
