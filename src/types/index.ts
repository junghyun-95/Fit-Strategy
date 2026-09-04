export type Gender = "men" | "women";
export type DataType = "actual_measurement" | "official_spec" | "ai_estimate";
export type FitName = "Regular" | "Semi-Over" | "Slim" | "Over";

export interface PomSpec {
  frontLength?: number;
  backLength?: number;
  chest?: number;
  waistPosition?: number;
  waist?: number;
  hem?: number;
  neckWidth?: number;
  frontNeckDepth?: number;
  backNeckDepth?: number;
  shoulder?: number;
  hwajang?: number;
  sleeveCircumference?: number;
  sleeveHem?: number;
  shoulderAngle?: number;
  armholeDepth?: number;
}

export const POM_FIELDS: (keyof PomSpec)[] = [
  "frontLength", "backLength", "chest", "waistPosition", "waist", "hem",
  "neckWidth", "frontNeckDepth", "backNeckDepth", "shoulder", "hwajang",
  "sleeveCircumference", "sleeveHem", "shoulderAngle", "armholeDepth",
];

export interface OwnFit {
  id: string;
  name: string;
  gender: Gender;
  tagline: string | null;
  spec: PomSpec;
  images: { crop: string | null; full: string | null; product: string | null };
}

export interface PlmSpec {
  id: string;
  productCode: string;
  productName: string;
  gender: Gender;
  season: "25S" | "26S";
  baseSize: string;
  fitName: FitName;
  spec: PomSpec;
  imageUrl: string | null;
  techPackUrl: string | null;
}

export interface MarketEntry {
  id: string;
  brand: string;
  style: string;
  gender: Gender;
  fitRaw: string | null;
  spec: PomSpec;
  dataType: DataType;
  imagePath: string | null;
  sourceUrl: string | null;
}
