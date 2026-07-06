import type { ConfiguratorConfig, GarmentFit } from "@/types/configurator";
import { getGarment } from "@/lib/garments";

type Money = { THB: number; USD: number };

const FIT_DELTA: Record<GarmentFit, Money> = {
  slim: { THB: 0, USD: 0 },
  regular: { THB: 0, USD: 0 },
  oversized: { THB: 100, USD: 3 },
};

const GRAPHIC_SURCHARGE: Money = { THB: 150, USD: 5 };
const TEXT_SURCHARGE: Money = { THB: 100, USD: 3 };

function add(a: Money, b: Money): Money {
  return { THB: a.THB + b.THB, USD: a.USD + b.USD };
}

export function calculatePrice(config: ConfiguratorConfig): Money {
  const garment = getGarment(config.garmentStyle);
  let total: Money = garment ? { ...garment.basePrice } : { THB: 0, USD: 0 };

  total = add(total, FIT_DELTA[config.fit]);

  for (const side of [config.front, config.back]) {
    if (side.graphic) total = add(total, GRAPHIC_SURCHARGE);
    if (side.text) total = add(total, TEXT_SURCHARGE);
  }

  return total;
}
