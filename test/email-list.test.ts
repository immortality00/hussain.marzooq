import { describe, expect, test } from "vitest";
import {
  DEFAULT_EMAIL_LIST,
  emailListForSave,
  localPartError,
  localPartOf,
  shownEmails,
  siteAddressOf,
} from "@/lib/email-list";

const row = (address: string, label = "Label", shown = true) => ({ label, address, shown });

describe("the default list", () => {
  test("shows bookings and inquiries, then press, privacy and Hussain, all on site", () => {
    expect(DEFAULT_EMAIL_LIST.map((item) => item.address)).toEqual([
      "book@hussain.art",
      "inquiries@hussain.art",
      "press@hussain.art",
      "privacy@hussain.art",
      "hussain@hussain.art",
    ]);
    expect(DEFAULT_EMAIL_LIST.every((item) => item.shown)).toBe(true);
  });

  test("passes its own save check unchanged", () => {
    expect(emailListForSave(DEFAULT_EMAIL_LIST)).toEqual({ emails: DEFAULT_EMAIL_LIST });
  });
});

describe("the name before @hussain.art", () => {
  test("is split off and rebuilt, and a pasted ending is not doubled", () => {
    expect(localPartOf("press@hussain.art")).toBe("press");
    expect(localPartOf("press@Hussain.Art")).toBe("press");
    expect(siteAddressOf("press")).toBe("press@hussain.art");
    expect(siteAddressOf(" press@hussain.art ")).toBe("press@hussain.art");
    expect(siteAddressOf("")).toBe("@hussain.art");
  });

  test.each(["book", "studio.bookings", "a", "x_1-2"])("accepts %s", (name) => {
    expect(localPartError(name)).toBeNull();
  });

  test.each([
    ["", "add the name"],
    ["a b", "use letters"],
    [".book", "use letters"],
    ["book.", "use letters"],
    ["bo..ok", "use letters"],
    ["x@gmail.com", "use letters"],
    ["a".repeat(65), "over 64 characters"],
  ])("refuses %j", (name, reason) => {
    expect(localPartError(name)).toContain(reason);
  });
});

describe("emailListForSave", () => {
  test("trims, lowercases and keeps the order and each row's switch", () => {
    expect(emailListForSave([row(" Book@Hussain.Art ", " Bookings "), row("press@hussain.art", "Press", false)])).toEqual({
      emails: [
        { label: "Bookings", address: "book@hussain.art", shown: true },
        { label: "Press", address: "press@hussain.art", shown: false },
      ],
    });
  });

  test("drops empty rows and keeps a row with no label", () => {
    expect(emailListForSave([row("@hussain.art", ""), row("", " "), row("book@hussain.art", "")])).toEqual({
      emails: [{ label: "", address: "book@hussain.art", shown: true }],
    });
  });

  test("a row without its switch is saved hidden", () => {
    expect(emailListForSave([{ label: "Book", address: "book@hussain.art" }])).toEqual({
      emails: [{ label: "Book", address: "book@hussain.art", shown: false }],
    });
  });

  test.each([
    ["another domain", [row("me@gmail.com")], "Email 1: only @hussain.art addresses can be listed."],
    ["a lookalike domain", [row("me@hussain.art.example.com")], "Email 1: only @hussain.art addresses can be listed."],
    ["a label with no name", [row("book@hussain.art"), row("@hussain.art", "Studio")], "Email 2: add the name before @hussain.art."],
    ["a bad name", [row("bo ok@hussain.art")], "Email 1: use letters"],
    ["a duplicate", [row("book@hussain.art"), row("BOOK@hussain.art")], "Email 2: book@hussain.art is already in the list."],
    ["a long label", [row("book@hussain.art", "x".repeat(61))], "Email 1: the label is over 60 characters."],
    ["a label that is not text", [{ label: 5, address: "book@hussain.art", shown: true }], "Email 1: the label must be text."],
    ["an address that is not text", [{ label: "Book", address: ["x"], shown: true }], "Email 1: the address must be text."],
    ["a row that is not an object", ["book@hussain.art"], "Email 1: not a valid row."],
    ["eleven addresses", Array.from({ length: 11 }, (_, i) => row(`a${i}@hussain.art`)), "The list takes up to 10 addresses."],
    ["a list that is not a list", "book@hussain.art", "The email list must be a list."],
    ["a huge list", Array.from({ length: 51 }, () => row("")), "The email list must be a list."],
  ])("refuses %s", (_, value, message) => {
    const saved = emailListForSave(value);
    expect(saved).toHaveProperty("error");
    expect((saved as { error: string }).error).toContain(message);
  });
});

describe("shownEmails", () => {
  test("keeps only rows set to On site, in order", () => {
    expect(shownEmails([row("a@hussain.art", "A"), row("b@hussain.art", "B", false), row("c@hussain.art", "C")])).toEqual([
      row("a@hussain.art", "A"),
      row("c@hussain.art", "C"),
    ]);
  });

  test("leaves out anything malformed in a stored list", () => {
    expect(shownEmails("x")).toEqual([]);
    expect(shownEmails([null, { address: 5, shown: true }, { address: "", shown: true }, { address: "a@hussain.art", shown: true }])).toEqual([
      { label: "", address: "a@hussain.art", shown: true },
    ]);
  });
});
