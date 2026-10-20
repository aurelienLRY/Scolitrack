import { cn, formatDate } from "@/lib/utils";

describe("cn", () => {
  it("fusionne les classes Tailwind en conflit", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });

  it("ignore les valeurs vides", () => {
    expect(cn("text-sm", false && "hidden", undefined, "font-medium")).toBe(
      "text-sm font-medium"
    );
  });
});

describe("formatDate", () => {
  it("formate une date en français", () => {
    expect(formatDate(new Date(2026, 9, 20))).toBe("20 octobre 2026");
  });
});
