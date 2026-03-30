import type { WeaponSystem } from '../types';

export const weaponSystems: WeaponSystem[] = [
  // Iran - Drones
  { id: 'ir-shahed-136', name: 'Shahed-136', country: 'IR', category: 'drones', unitCost: 25000, description: 'One-way attack drone, ~2,500km range, 40kg warhead' },
  { id: 'ir-shahed-131', name: 'Shahed-131', country: 'IR', category: 'drones', unitCost: 20000, description: 'Smaller variant of Shahed-136, ~900km range' },
  { id: 'ir-hadid-110', name: 'Hadid-110', country: 'IR', category: 'drones', unitCost: 40000, description: 'New fast attack drone, 510km/h, 3x faster than Shahed' },

  // Iran - Missiles
  { id: 'ir-fateh-313', name: 'Fateh-313', country: 'IR', category: 'missiles', unitCost: 300000, description: 'Solid-fuel SRBM, 500km range, 500kg warhead' },
  { id: 'ir-kheibar-shekan', name: 'Kheibar Shekan', country: 'IR', category: 'missiles', unitCost: 500000, description: 'Solid-fuel MRBM, 1,450km range' },
  { id: 'ir-fattah', name: 'Fattah Hypersonic', country: 'IR', category: 'missiles', unitCost: 800000, description: 'Hypersonic missile with maneuverable warhead' },
  { id: 'ir-cruise', name: 'Cruise Missiles', country: 'IR', category: 'missiles', unitCost: 200000, description: 'Various cruise missiles (Paveh, Hoveyzeh)' },

  // Iran - Defense
  { id: 'ir-bavar-373', name: 'Bavar-373', country: 'IR', category: 'defense', unitCost: 2000000, description: 'Long-range SAM system, 300km range' },
  { id: 'ir-s300', name: 'S-300', country: 'IR', category: 'defense', unitCost: 3000000, description: 'Russian-supplied long-range air defense' },
  { id: 'ir-khordad-15', name: 'Khordad-15', country: 'IR', category: 'defense', unitCost: 1500000, description: 'Medium-range air defense system' },

  // US - Drones
  { id: 'us-mq9', name: 'MQ-9 Reaper', country: 'US', category: 'drones', unitCost: 32000000, description: 'Long-endurance armed reconnaissance drone' },
  { id: 'us-lucas', name: 'LUCAS', country: 'US', category: 'drones', unitCost: 500000, description: 'Low-Cost Uncrewed Combat Attack System (combat debut)' },

  // US - Missiles
  { id: 'us-tomahawk', name: 'Tomahawk', country: 'US', category: 'missiles', unitCost: 2200000, description: 'Cruise missile, 1,600km range, GPS/INS guided' },
  { id: 'us-prsm', name: 'PrSM', country: 'US', category: 'missiles', unitCost: 1500000, description: 'Precision Strike Missile, combat debut 2026' },
  { id: 'us-jdam', name: 'JDAM', country: 'US', category: 'missiles', unitCost: 25000, description: 'GPS-guided bomb kit, dropped from B-2/B-1/B-52' },

  // US - Defense
  { id: 'us-patriot', name: 'Patriot PAC-3', country: 'US', category: 'defense', unitCost: 4000000, description: 'PAC-3 MSE interceptor, primary air defense' },
  { id: 'us-thaad', name: 'THAAD', country: 'US', category: 'defense', unitCost: 15000000, description: 'Terminal High Altitude Area Defense interceptor' },
  { id: 'us-sm3', name: 'SM-3', country: 'US', category: 'defense', unitCost: 12000000, description: 'Navy Aegis ship-based ballistic missile interceptor' },

  // Israel - Drones
  { id: 'il-harop', name: 'IAI Harop', country: 'IL', category: 'drones', unitCost: 10000000, description: 'Loitering munition, 6+ hour endurance' },
  { id: 'il-heron', name: 'Heron TP', country: 'IL', category: 'drones', unitCost: 35000000, description: 'Strategic MALE UAV for ISR and strikes' },

  // Israel - Missiles
  { id: 'il-lora', name: 'LORA', country: 'IL', category: 'missiles', unitCost: 1000000, description: 'Long-range quasi-ballistic missile, 430km, CEP 10m' },
  { id: 'il-air-strikes', name: 'Air-launched munitions', country: 'IL', category: 'missiles', unitCost: 50000, description: 'Various air-to-ground munitions (F-35I, F-15I sorties)' },

  // Israel - Defense
  { id: 'il-iron-dome', name: 'Iron Dome', country: 'IL', category: 'defense', unitCost: 60000, description: 'Short-range interceptor, Tamir missile' },
  { id: 'il-davids-sling', name: "David's Sling", country: 'IL', category: 'defense', unitCost: 700000, description: 'Medium-range interceptor for ballistic/cruise missiles' },
  { id: 'il-arrow-2', name: 'Arrow 2', country: 'IL', category: 'defense', unitCost: 3000000, description: 'Endo-atmospheric ballistic missile interceptor' },
  { id: 'il-arrow-3', name: 'Arrow 3', country: 'IL', category: 'defense', unitCost: 3000000, description: 'Exo-atmospheric ballistic missile interceptor' },
  { id: 'il-iron-beam', name: 'Iron Beam', country: 'IL', category: 'defense', unitCost: 2000, description: 'Directed-energy laser defense system' },

  // UAE - Drones (anti-drone role)
  { id: 'ae-apache', name: 'AH-64E Apache', country: 'AE', category: 'drones', unitCost: null, description: 'Apache gunships used in anti-drone role' },

  // UAE - Defense
  { id: 'ae-thaad', name: 'THAAD', country: 'AE', category: 'defense', unitCost: 15000000, description: 'US-supplied THAAD batteries (2 operational)' },
  { id: 'ae-patriot', name: 'Patriot', country: 'AE', category: 'defense', unitCost: 4000000, description: 'US-supplied Patriot air defense system' },
  { id: 'ae-cheongung', name: 'Cheongung-II', country: 'AE', category: 'defense', unitCost: 2000000, description: 'South Korean medium-range KM-SAM' },
];

export const WEAPON_MAP: Record<string, WeaponSystem> = Object.fromEntries(
  weaponSystems.map((w) => [w.id, w])
);
