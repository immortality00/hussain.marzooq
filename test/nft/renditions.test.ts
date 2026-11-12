import { expect, test } from "vitest";
import { fitWithin } from "@/lib/client/nft-renditions";

test("fitWithin scales the long edge down and never enlarges", () => {
  expect(fitWithin({ width: 5464, height: 8192 }, 2048)).toEqual({ width: 1366, height: 2048 });
  expect(fitWithin({ width: 8192, height: 5464 }, 2048)).toEqual({ width: 2048, height: 1366 });
  expect(fitWithin({ width: 1200, height: 800 }, 2048)).toEqual({ width: 1200, height: 800 });
  expect(fitWithin({ width: 4000, height: 4000 }, 350)).toEqual({ width: 350, height: 350 });
  expect(fitWithin({ width: 10000, height: 3 }, 350)).toEqual({ width: 350, height: 1 });
});
