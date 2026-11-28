// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { canStartPull } from "@/components/shared/pull-refresh/pull-start";

function page(html: string) {
  document.body.innerHTML = `<div data-pull-moves><main>${html}</main></div><nav id="bar"><button id="tab">Tab</button></nav>`;
}

const at = (id: string) => document.getElementById(id);

afterEach(() => {
  document.body.innerHTML = "";
  document.documentElement.style.overflow = "";
  document.getSelection()?.removeAllRanges();
});

describe("where a pull may start", () => {
  it("on the page itself: text, a heading, a link or a button", () => {
    page(`<h1 id="title">Media</h1><a id="link" href="/x">Open</a><button id="button">Save</button>`);
    expect(canStartPull(at("title"))).toBe(true);
    expect(canStartPull(at("link"))).toBe(true);
    expect(canStartPull(at("button"))).toBe(true);
  });

  it("not outside the page's blocks (the bottom bar, a message, a floating button)", () => {
    page(`<p>x</p>`);
    expect(canStartPull(at("tab"))).toBe(false);
    expect(canStartPull(null)).toBe(false);
  });

  it("not on a field, nor while one has the keyboard", () => {
    page(`<input id="search" /><textarea id="note"></textarea><select id="pick"><option>a</option></select>
      <div id="edit" contenteditable="true">x</div><input id="box" type="checkbox" /><p id="text">x</p>`);
    for (const id of ["search", "note", "pick", "edit", "box"]) expect(canStartPull(at(id))).toBe(false);
    expect(canStartPull(at("text"))).toBe(true);
    (at("search") as HTMLInputElement).focus();
    expect(canStartPull(at("text"))).toBe(false);
  });

  it("a ticked checkbox keeping the focus does not stop it", () => {
    page(`<input id="box" type="checkbox" /><p id="text">x</p>`);
    (at("box") as HTMLInputElement).focus();
    expect(canStartPull(at("text"))).toBe(true);
  });

  it("not while a window is open or the page is locked", () => {
    page(`<p id="text">x</p>`);
    const dialog = document.createElement("div");
    dialog.setAttribute("aria-modal", "true");
    document.body.append(dialog);
    expect(canStartPull(at("text"))).toBe(false);
    dialog.remove();
    document.documentElement.style.overflow = "hidden";
    expect(canStartPull(at("text"))).toBe(false);
  });

  it("not on something that handles its own drag, nor on a bar floating over the page", () => {
    page(`<div style="touch-action: none"><span id="handle">⠿</span></div>
      <div style="touch-action: pan-x"><span id="chips">chip</span></div>
      <div style="touch-action: pan-y"><span id="strip">strip</span></div>
      <div style="position: fixed"><span id="cta">Book</span></div>`);
    expect(canStartPull(at("handle"))).toBe(false);
    expect(canStartPull(at("chips"))).toBe(false);
    expect(canStartPull(at("strip"))).toBe(true);
    expect(canStartPull(at("cta"))).toBe(false);
  });

  it("not inside a box scrolled down; one at its top lets the pull through", () => {
    page(`<div id="list" style="overflow-y: auto"><p id="row">row</p></div>`);
    const list = at("list")!;
    Object.defineProperty(list, "scrollHeight", { value: 800 });
    Object.defineProperty(list, "clientHeight", { value: 200 });
    expect(canStartPull(at("row"))).toBe(true);
    list.scrollTop = 40;
    expect(canStartPull(at("row"))).toBe(false);
  });

  it("not while text is selected", () => {
    page(`<p id="text">Seed Client</p>`);
    const range = document.createRange();
    range.selectNodeContents(at("text")!);
    document.getSelection()?.addRange(range);
    expect(canStartPull(at("text"))).toBe(false);
  });
});
