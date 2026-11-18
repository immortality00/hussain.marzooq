"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { addressValuesKey, readAddressValues, withAddressValues, type AddressValues } from "@/lib/address-values";
import { changeAddress } from "@/lib/client/address-writer";

// A screen's search and filters, kept in its address. The screen shows `values` at once and the address
// follows (lib/client/address-writer.ts); when the address changes from outside — a link to the same screen
// with other filters — the values follow it. The screen's AdminScreen lists these keys as `stable`, so a
// change to them does not open the screen afresh.
export function useAddressValues<K extends string>(keys: readonly K[]) {
  const owner = useId();
  const pathname = usePathname();
  const fromAddress = readAddressValues(useSearchParams(), keys);
  const addressKey = addressValuesKey(fromAddress);
  const [values, setValues] = useState(fromAddress);
  const [seenKey, setSeenKey] = useState(addressKey);

  if (addressKey !== seenKey) {
    setSeenKey(addressKey);
    if (addressKey !== addressValuesKey(values)) setValues(fromAddress);
  }

  useEffect(() => {
    if (addressValuesKey(values) === addressKey) return;
    changeAddress(owner, pathname, (search) => withAddressValues(search, values));
  }, [owner, pathname, values, addressKey]);

  const set = useCallback(
    (patch: Partial<AddressValues<K>>) => setValues((previous) => ({ ...previous, ...patch })),
    []
  );

  return [values, set] as const;
}
