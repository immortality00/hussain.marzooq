"use client";

import { Suspense, useEffect, useState, type ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { LoadingScreen } from "@/components/shared/LoadingScreen";
import { AdminButton } from "@/components/admin/AdminButton";
import { adminSignInHref, refreshAdminData, screenHeld, type AdminSlice } from "@/lib/client/admin-store";
import {
  useAdminData,
  useAdminDataFailure,
  useAdminChanges,
  useAdminPreview,
  useAdminSignedOut,
} from "@/hooks/useAdminData";

const loader = <LoadingScreen className="min-h-[60dvh]" />;
const HOLD_LIMIT_MS = 1200;

type ScreenProps = { children: ReactNode; preview?: boolean; reads: readonly AdminSlice[] };

function useHeldOnOpen(reads: readonly AdminSlice[]) {
  const hold = screenHeld(useAdminChanges(), reads);
  const [opened, setOpened] = useState(!hold);
  if (!opened && !hold) setOpened(true);

  useEffect(() => {
    if (opened) return;
    const timer = window.setTimeout(() => setOpened(true), HOLD_LIMIT_MS);
    return () => window.clearTimeout(timer);
  }, [opened]);

  return !opened;
}

export function AdminStatus({ failure, signedOut, retry }: { failure: string | null; signedOut: boolean; retry: () => void }) {
  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-sm text-muted-foreground">{signedOut ? "Signed out." : failure}</p>
      {signedOut ? (
        <AdminButton variant="solid" onClick={() => location.assign(adminSignInHref())}>
          Sign in
        </AdminButton>
      ) : (
        <AdminButton onClick={retry}>Try again</AdminButton>
      )}
    </div>
  );
}

function Screen({ children, preview = false, reads }: ScreenProps) {
  const data = useAdminData();
  const early = useAdminPreview();
  const failure = useAdminDataFailure();
  const signedOut = useAdminSignedOut();
  const held = useHeldOnOpen(reads);

  if (held) return loader;
  if (!data && !(preview && early)) {
    if (!failure && !signedOut) return loader;
    return <AdminStatus failure={failure} signedOut={signedOut} retry={() => void refreshAdminData()} />;
  }
  return <Suspense fallback={loader}>{children}</Suspense>;
}

function AddressedScreen(props: ScreenProps) {
  const address = `${usePathname()}?${useSearchParams().toString()}`;
  return <Screen key={address} {...props} />;
}

export function AdminScreen(props: ScreenProps) {
  return (
    <Suspense fallback={loader}>
      <AddressedScreen {...props} />
    </Suspense>
  );
}
