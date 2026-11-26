// @vitest-environment jsdom
import { createElement, Fragment, type MouseEvent } from "react";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import {
  ConfirmDialog,
  deleteQuestion,
  useConfirmDialog,
  type ConfirmQuestion,
} from "@/components/admin/choice-dialog/ConfirmDialog";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";

const escape = () => fireEvent.keyDown(window, { key: "Escape" });

function Asker({ question, onAnswer }: { question: ConfirmQuestion; onAnswer: (yes: boolean) => void }) {
  const confirmation = useConfirmDialog();
  return createElement(
    Fragment,
    null,
    createElement("button", { type: "button", onClick: async () => onAnswer(await confirmation.ask(question)) }, "Ask"),
    createElement(ConfirmDialog, { dialog: confirmation.dialog })
  );
}

const QUESTION_NAME = "Delete “Seed Photo 36”?";

async function ask(onAnswer: (yes: boolean) => void) {
  render(createElement(Asker, { question: deleteQuestion("“Seed Photo 36”"), onAnswer }));
  fireEvent.click(screen.getByRole("button", { name: "Ask" }));
  return screen.findByRole("dialog", { name: QUESTION_NAME });
}

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

describe("the confirm dialog", () => {
  test("names the thing, says what follows, starts on Cancel, and goes ahead only on its action", async () => {
    const onAnswer = vi.fn();
    const dialog = await ask(onAnswer);

    expect(within(dialog).getByText("This can't be undone.")).toBeTruthy();
    expect(document.activeElement).toBe(within(dialog).getByRole("button", { name: "Cancel" }));

    await act(async () => {
      fireEvent.click(within(dialog).getByRole("button", { name: "Delete" }));
    });
    expect(onAnswer).toHaveBeenCalledWith(true);
    expect(screen.queryByRole("dialog", { name: QUESTION_NAME })).toBeNull();
  });

  test("Cancel, Escape and a tap outside each answer no", async () => {
    const onAnswer = vi.fn();
    const first = await ask(onAnswer);
    await act(async () => {
      fireEvent.click(within(first).getByRole("button", { name: "Cancel" }));
    });

    fireEvent.click(screen.getByRole("button", { name: "Ask" }));
    await screen.findByRole("dialog", { name: QUESTION_NAME });
    await act(async () => escape());

    fireEvent.click(screen.getByRole("button", { name: "Ask" }));
    const third = await screen.findByRole("dialog", { name: QUESTION_NAME });
    await act(async () => {
      fireEvent.click(third);
    });

    expect(onAnswer.mock.calls).toEqual([[false], [false], [false]]);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  test("an action other than Delete keeps its own words, and the Cancel button can say Keep editing", async () => {
    render(
      createElement(Asker, {
        question: { heading: "Archive 3 inquiries?", action: "Archive", cancelLabel: "Keep editing" },
        onAnswer: vi.fn(),
      })
    );
    fireEvent.click(screen.getByRole("button", { name: "Ask" }));
    const dialog = await screen.findByRole("dialog", { name: "Archive 3 inquiries?" });
    expect(within(dialog).getAllByRole("button").map((b) => b.textContent)).toEqual(["Keep editing", "Archive"]);
  });
});

describe("the unsaved-changes check on links", () => {
  function Page({ dirty, onFollow }: { dirty: boolean; onFollow: () => void }) {
    const leaveDialog = useUnsavedChangesGuard(dirty);
    const follow = (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      onFollow();
    };
    return createElement(
      Fragment,
      null,
      createElement("a", { href: "/admin/other", onClick: follow }, "Other page"),
      createElement("a", { href: "/?tab=2", onClick: follow }, "Same page"),
      createElement(ConfirmDialog, { dialog: leaveDialog })
    );
  }

  const otherPage = () => screen.getByRole("link", { name: "Other page" });

  test("with changes, a link asks first; Keep editing stays, Discard follows that link once", async () => {
    const onFollow = vi.fn();
    render(createElement(Page, { dirty: true, onFollow }));

    fireEvent.click(otherPage());
    const question = await screen.findByRole("dialog", { name: "Discard your changes?" });
    expect(onFollow).not.toHaveBeenCalled();

    await act(async () => {
      fireEvent.click(within(question).getByRole("button", { name: "Keep editing" }));
    });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(onFollow).not.toHaveBeenCalled();

    fireEvent.click(otherPage());
    const again = await screen.findByRole("dialog", { name: "Discard your changes?" });
    await act(async () => {
      fireEvent.click(within(again).getByRole("button", { name: "Discard" }));
    });
    expect(onFollow).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  test("a link to the same page, a modified click, or no changes go straight through", () => {
    const onFollow = vi.fn();
    const { rerender } = render(createElement(Page, { dirty: true, onFollow }));

    fireEvent.click(screen.getByRole("link", { name: "Same page" }));
    fireEvent.click(otherPage(), { metaKey: true });
    expect(onFollow).toHaveBeenCalledTimes(2);

    rerender(createElement(Page, { dirty: false, onFollow }));
    fireEvent.click(otherPage());
    expect(onFollow).toHaveBeenCalledTimes(3);
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
