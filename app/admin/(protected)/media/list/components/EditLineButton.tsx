import { Pencil } from "lucide-react";
import { adminButtonClasses } from "@/components/admin/AdminButton";

export function EditLineButton({
  label,
  disabled,
  focusOnMount,
  onClick,
}: {
  label: string;
  disabled: boolean;
  focusOnMount: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      autoFocus={focusOnMount}
      onClick={onClick}
      className={adminButtonClasses("ghost", "xs", "-my-1.5 ml-auto size-8 shrink-0 p-0 text-muted-foreground hover:text-foreground")}
    >
      <Pencil aria-hidden className="size-3.5" />
    </button>
  );
}
