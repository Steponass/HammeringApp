import type { ObjectDefinition, NailDefinition } from "types/objects";
import { SVG_ASSETS } from "../assets/svgs";

// Nail types - using placeholder icons until SVGs are created
export const NAIL_DEFINITIONS: Record<string, NailDefinition> = {
  "nailReady1": {
    id: "nailReady1",
    name: "Nail Ready 1",
    svgPath: SVG_ASSETS.nailReady1,
    hammeredSvgPath: SVG_ASSETS.nailDone1,
    placeholder: "🔩",
  },
  "nailReady2": {
    id: "nailReady2",
    name: "Nail Ready 2",
    svgPath: SVG_ASSETS.nailReady2,
    hammeredSvgPath: SVG_ASSETS.nailDone2,
    placeholder: "🔩",
  },
  "nailReady3": {
    id: "nailReady3",
    name: "Nail Ready 3",
    svgPath: SVG_ASSETS.nailReady3,
    hammeredSvgPath: SVG_ASSETS.nailDone3,
    placeholder: "🔩",
  }
};

// Helper to randomly assign nail types
const getNailTypes = () => Object.keys(NAIL_DEFINITIONS);
const getRandomNailType = (): string => {
  const nailTypes = getNailTypes();
  return nailTypes[Math.floor(Math.random() * nailTypes.length)];
};

// Helper to randomly assign base size between 56px and 72px
const getRandomBaseSize = (): number => {
  return Math.floor(Math.random() * (72 - 56 + 1)) + 56;
};

// Real object definitions using actual SVG files
export const OBJECT_DEFINITIONS: Record<string, ObjectDefinition> = {
  dashboard: {
    id: "dashboard",
    name: "Dashboard",
    svgPath: SVG_ASSETS.dashboard,
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  key: {
    id: "key",
    name: "Key",
    svgPath: SVG_ASSETS.key,
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  umbrella: {
    id: "umbrella",
    name: "Umbrella",
    svgPath: SVG_ASSETS.umbrella,
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  target: {
    id: "target",
    name: "Target",
    svgPath: SVG_ASSETS.target,
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  shop: {
    id: "shop",
    name: "Shop",
    svgPath: SVG_ASSETS.shop,
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  pencil: {
    id: "pencil",
    name: "Pencil",
    svgPath: SVG_ASSETS.pencil,
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  lock: {
    id: "lock",
    name: "Lock",
    svgPath: SVG_ASSETS.lock,
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  martini: {
    id: "martini",
    name: "Martini",
    svgPath: SVG_ASSETS.martini,
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  map: {
    id: "map",
    name: "Map",
    svgPath: SVG_ASSETS.map,
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  medal: {
    id: "medal",
    name: "Medal",
    svgPath: SVG_ASSETS.medal,
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  rocket: {
    id: "rocket",
    name: "Rocket",
    svgPath: SVG_ASSETS.rocket,
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  "t-shirt": {
    id: "t-shirt",
    name: "T-shirt",
    svgPath: SVG_ASSETS["t-shirt"],
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  wallet: {
    id: "wallet",
    name: "Wallet",
    svgPath: SVG_ASSETS.wallet,
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  wrench: {
    id: "wrench",
    name: "Wrench",
    svgPath: SVG_ASSETS.wrench,
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  trashcan: {
    id: "trashcan",
    name: "Trashcan",
    svgPath: SVG_ASSETS.trashcan,
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  shorts: {
    id: "shorts",
    name: "Shorts",
    svgPath: SVG_ASSETS.shorts,
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  tea: {
    id: "tea",
    name: "Tea",
    svgPath: SVG_ASSETS.tea,
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  "shopping-card": {
    id: "shopping-card",
    name: "Shopping Card",
    svgPath: SVG_ASSETS["shopping-card"],
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  "med-kit": {
    id: "med-kit",
    name: "Med Kit",
    svgPath: SVG_ASSETS["med-kit"],
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  "magnifying-glass": {
    id: "magnifying-glass",
    name: "Magnifying Glass",
    svgPath: SVG_ASSETS["magnifying-glass"],
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  basketball: {
    id: "basketball",
    name: "Basketball",
    svgPath: SVG_ASSETS.basketball,
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  skate: {
    id: "skate",
    name: "Skate",
    svgPath: SVG_ASSETS.skate,
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  arrest: {
    id: "arrest",
    name: "Arrest",
    svgPath: SVG_ASSETS.arrest,
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  drill: {
    id: "drill",
    name: "Drill",
    svgPath: SVG_ASSETS.drill,
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  chemistry: {
    id: "chemistry",
    name: "Chemistry",
    svgPath: SVG_ASSETS.chemistry,
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  "globe-map": {
    id: "globe-map",
    name: "Globe Map",
    svgPath: SVG_ASSETS["globe-map"],
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  certificate: {
    id: "certificate",
    name: "Certificate",
    svgPath: SVG_ASSETS.certificate,
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  drug: {
    id: "drug",
    name: "Drug",
    svgPath: SVG_ASSETS.drug,
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  hammer: {
    id: "hammer",
    name: "Hammer",
    svgPath: SVG_ASSETS.hammer,
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  "dinner-love": {
    id: "dinner-love",
    name: "Dinner Love",
    svgPath: SVG_ASSETS["dinner-love"],
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  "gift-heart-2": {
    id: "gift-heart-2",
    name: "Gift Heart 2",
    svgPath: SVG_ASSETS["gift-heart-2"],
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  "-file-heart": {
    id: "-file-heart",
    name: "File Heart",
    svgPath: SVG_ASSETS["file-heart"],
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  "wrist-watch": {
    id: "wrist-watch",
    name: "Wrist Watch",
    svgPath: SVG_ASSETS["wrist-watch"],
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  ring: {
    id: "ring",
    name: "Ring",
    svgPath: SVG_ASSETS.ring,
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  slippers: {
    id: "slippers",
    name: "Slippers",
    svgPath: SVG_ASSETS.slippers,
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  headset: {
    id: "headset",
    name: "Headset",
    svgPath: SVG_ASSETS.headset,
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  "discount-label": {
    id: "discount-label",
    name: "Discount Label",
    svgPath: SVG_ASSETS["discount-label"],
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  lamp: {
    id: "lamp",
    name: "Lamp",
    svgPath: SVG_ASSETS.lamp,
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  helicopter: {
    id: "helicopter",
    name: "Helicopter",
    svgPath: SVG_ASSETS.helicopter,
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  "car-1": {
    id: "car-1",
    name: "Car 1",
    svgPath: SVG_ASSETS["car-1"],
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  bike: {
    id: "bike",
    name: "Bike",
    svgPath: SVG_ASSETS.bike,
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  "car-2": {
    id: "car-2",
    name: "Car 2",
    svgPath: SVG_ASSETS["car-2"],
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  minibus: {
    id: "minibus",
    name: "Minibus",
    svgPath: SVG_ASSETS.minibus,
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  "sun-hat": {
    id: "sun-hat",
    name: "Sun Hat",
    svgPath: SVG_ASSETS["sun-hat"],
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  trilby: {
    id: "trilby",
    name: "Trilby",
    svgPath: SVG_ASSETS.trilby,
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  "red-shoe": {
    id: "red-shoe",
    name: "Red Shoe",
    svgPath: SVG_ASSETS["red-shoe"],
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  "red-snazzy-shorts": {
    id: "red-snazzy-shorts",
    name: "Red Snazzy Shorts",
    svgPath: SVG_ASSETS["red-snazzy-shorts"],
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  "gray-tshirt": {
    id: "gray-tshirt",
    name: "Gray Tshirt",
    svgPath: SVG_ASSETS["gray-tshirt"],
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  "green-pants": {
    id: "green-pants",
    name: "Green Pants",
    svgPath: SVG_ASSETS["green-pants"],
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  lightbulb: {
    id: "lightbulb",
    name: "Lightbulb",
    svgPath: SVG_ASSETS.lightbulb,
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  calculator: {
    id: "calculator",
    name: "Calculator",
    svgPath: SVG_ASSETS.calculator,
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  "data-trends": {
    id: "data-trends",
    name: "Data Trends",
    svgPath: SVG_ASSETS["data-trends"],
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  record: {
    id: "record",
    name: "Record",
    svgPath: SVG_ASSETS.record,
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  "data-report": {
    id: "data-report",
    name: "Data Report",
    svgPath: SVG_ASSETS["data-report"],
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  "alarm-clock": {
    id: "alarm-clock",
    name: "Alarm Clock",
    svgPath: SVG_ASSETS["alarm-clock"],
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  safe: {
    id: "safe",
    name: "Safe",
    svgPath: SVG_ASSETS.safe,
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  "credit-cards": {
    id: "credit-cards",
    name: "Credit Cards",
    svgPath: SVG_ASSETS["credit-cards"],
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  "washing-machine": {
    id: "washing-machine",
    name: "Washing Machine",
    svgPath: SVG_ASSETS["washing-machine"],
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  "vacuum-cleaner": {
    id: "vacuum-cleaner",
    name: "Vacuum Cleaner",
    svgPath: SVG_ASSETS["vacuum-cleaner"],
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  beer: {
    id: "beer",
    name: "Beer",
    svgPath: SVG_ASSETS.beer,
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  "air-conditioner": {
    id: "air-conditioner",
    name: "Air Conditioner",
    svgPath: SVG_ASSETS["air-conditioner"],
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  donut: {
    id: "donut",
    name: "Donut",
    svgPath: SVG_ASSETS.donut,
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  drumstick: {
    id: "drumstick",
    name: "Drumstick",
    svgPath: SVG_ASSETS.drumstick,
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  bread: {
    id: "bread",
    name: "Bread",
    svgPath: SVG_ASSETS.bread,
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  cheese: {
    id: "cheese",
    name: "Cheese",
    svgPath: SVG_ASSETS.cheese,
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  hamburger: {
    id: "hamburger",
    name: "Hamburger",
    svgPath: SVG_ASSETS.hamburger,
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  "hot-dog": {
    id: "hot-dog",
    name: "Hot Dog",
    svgPath: SVG_ASSETS["hot-dog"],
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
  pizza: {
    id: "pizza",
    name: "Pizza",
    svgPath: SVG_ASSETS.pizza,
    baseSize: getRandomBaseSize(),
    nailType: getRandomNailType(),
  },
};

// Helper functions
export const getObjectDefinition = (
  objectType: string
): ObjectDefinition | undefined => {
  return OBJECT_DEFINITIONS[objectType];
};

export const getNailDefinition = (
  nailType: string
): NailDefinition | undefined => {
  return NAIL_DEFINITIONS[nailType];
};

export const getAllObjectTypes = (): string[] => {
  return Object.keys(OBJECT_DEFINITIONS);
};
