import { describe, expect, test } from "vitest";
import { DEFAULT_SUBSCRIBE_COPY, publishedSubscribeCopy, subscribeCopyForSave } from "@/lib/blog-subscribe-copy";

const copy = { heading: " Letters. ", text: "New work.", buttonLabel: "Sign me up", confirmation: "Check your inbox." };

describe("subscribeCopyForSave", () => {
  test("stores each field trimmed", () => {
    expect(subscribeCopyForSave(copy)).toEqual({ subscribe: { ...copy, heading: "Letters." } });
  });

  test("a missing field is stored empty", () => {
    expect(subscribeCopyForSave({ heading: "Letters." })).toEqual({
      subscribe: { heading: "Letters.", text: "", buttonLabel: "", confirmation: "" },
    });
  });

  test.each([
    ["wording that is not an object", "x", "Subscribe wording must be an object."],
    ["a heading that is not text", { ...copy, heading: { a: 1 } }, "Subscribe heading must be text."],
    ["a long heading", { ...copy, heading: "x".repeat(121) }, "Subscribe heading is over 120 characters."],
    ["a long line", { ...copy, text: "x".repeat(401) }, "Subscribe line is over 400 characters."],
    ["a long button label", { ...copy, buttonLabel: "x".repeat(41) }, "Subscribe button label is over 40 characters."],
    ["a long confirmation", { ...copy, confirmation: "x".repeat(201) }, "Subscribe confirmation is over 200 characters."],
  ])("refuses %s", (_, value, error) => {
    expect(subscribeCopyForSave(value)).toEqual({ error });
  });
});

describe("publishedSubscribeCopy", () => {
  test("shows the saved wording", () => {
    expect(publishedSubscribeCopy(copy)).toEqual({ ...copy, heading: "Letters." });
  });

  test("a blank heading or line is not shown; a blank button label or confirmation falls back", () => {
    expect(publishedSubscribeCopy({ heading: "", text: " ", buttonLabel: "", confirmation: "  " })).toEqual({
      heading: "",
      text: "",
      buttonLabel: DEFAULT_SUBSCRIBE_COPY.buttonLabel,
      confirmation: DEFAULT_SUBSCRIBE_COPY.confirmation,
    });
  });

  test("nothing stored shows the defaults", () => {
    expect(publishedSubscribeCopy(undefined)).toEqual(DEFAULT_SUBSCRIBE_COPY);
    expect(publishedSubscribeCopy({ heading: 4 })).toEqual(DEFAULT_SUBSCRIBE_COPY);
  });
});
