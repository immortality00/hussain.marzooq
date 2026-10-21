import { useEffect, useState } from "react";

// True while a review window is open. Those windows announce themselves with the
// `hm_modal_open` / `hm_modal_close` events; the navbar, the booking bar and the
// social links step aside for them.
export function useHiddenByModal() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onOpen = () => setHidden(true);
    const onClose = () => setHidden(false);
    window.addEventListener("hm_modal_open", onOpen);
    window.addEventListener("hm_modal_close", onClose);
    return () => {
      window.removeEventListener("hm_modal_open", onOpen);
      window.removeEventListener("hm_modal_close", onClose);
    };
  }, []);

  return hidden;
}
