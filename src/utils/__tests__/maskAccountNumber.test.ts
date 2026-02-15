import { describe, expect, it } from "vitest";
import { maskAccountNumber } from "../maskAccountNumber";

describe("maskAccountNumber", () => {
  it("masks a digit-only account number", () => {
    expect(maskAccountNumber("0457397801")).toBe("xxxx-xx-7801");
  });

  it("masks an account number with separators", () => {
    expect(maskAccountNumber("0457-397-801")).toBe("xxxx-xx-7801");
  });

  it("does not mask labels with incidental digits", () => {
    expect(maskAccountNumber("Checking 1")).toBe("Checking 1");
  });

  it("does not mask short numeric strings", () => {
    expect(maskAccountNumber("1234")).toBe("1234");
  });
});
