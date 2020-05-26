import { FieldType } from "./enums";

export const defaultCellValues = {
  [FieldType.number]: 0,
  [FieldType.bool]: false,
  [FieldType.subtotal]: 0,
  [FieldType.total]: 0,
  [FieldType.bonus]: 0,
  [FieldType.yahtzee]: 0,
  [FieldType.multiplier]: 0,
};

// ----- gameSchema interface definitions
export interface GameSchema {
  id: string;
  label: string;
  blocks: Record<string, BlockDef>;
}

export type BlockDef = BonusBlockDef | NoBonusBlockDef;

export interface NoBonusBlockDef extends DefaultBlockDef {
  hasBonus: false;
}

export interface BonusBlockDef extends DefaultBlockDef {
  hasBonus: true;
  bonusScore: number;
  bonusFor: number;
}

interface DefaultBlockDef {
  label: string;
  cells: Record<string, CellDef>;
}

export type CellDef =
  | BoolCellDef
  | MultiplierCellDef
  | NumberCellDef
  | YahtzeeCellDef;

export interface BoolCellDef extends DefaultCellDef {
  fieldType: FieldType.bool;
  score: number;
}

export interface MultiplierCellDef extends DefaultCellDef {
  fieldType: FieldType.multiplier;
  multiplier: number;
  maxMultiples: number;
}

export interface YahtzeeCellDef extends DefaultCellDef {
  fieldType: FieldType.yahtzee;
  score: number;
  maxYahtzees: number;
}

export interface NumberCellDef extends DefaultCellDef {
  fieldType: FieldType.number;
}

interface DefaultCellDef {
  label: string;
}

// ----- Predefined sets
const defaultDiceCount = 5;
const DEFAULT_RULESET = "DEFAULT_RULESET";

const gameSchemas: GameSchema[] = [
  {
    id: DEFAULT_RULESET,
    label: "Standard Kadi Rules (en)",
    blocks: {
      top: {
        label: "Upper",
        hasBonus: true,
        bonusScore: 35,
        bonusFor: 63,
        cells: {
          aces: {
            fieldType: FieldType.multiplier,
            label: "Aces",
            multiplier: 1,
            maxMultiples: defaultDiceCount,
          },

          twos: {
            fieldType: FieldType.multiplier,
            label: "Twos",
            multiplier: 2,
            maxMultiples: defaultDiceCount,
          },

          threes: {
            fieldType: FieldType.multiplier,
            label: "Threes",
            multiplier: 3,
            maxMultiples: defaultDiceCount,
          },

          fours: {
            fieldType: FieldType.multiplier,
            label: "Fours",
            multiplier: 4,
            maxMultiples: defaultDiceCount,
          },

          fives: {
            fieldType: FieldType.multiplier,
            label: "Fives",
            multiplier: 5,
            maxMultiples: defaultDiceCount,
          },

          sixes: {
            fieldType: FieldType.multiplier,
            label: "Sixes",
            multiplier: 6,
            maxMultiples: defaultDiceCount,
          },
        },
      },
      bottom: {
        label: "Lower",
        hasBonus: false,
        cells: {
          three_kind: {
            fieldType: FieldType.number,
            label: "Three of a Kind",
          },

          four_kind: {
            fieldType: FieldType.number,
            label: "Four of a Kind",
          },

          full_house: {
            fieldType: FieldType.bool,
            label: "Full House",
            score: 25,
          },

          sml_straight: {
            fieldType: FieldType.bool,
            label: "Small Straight",
            score: 30,
          },

          lg_straight: {
            fieldType: FieldType.bool,
            label: "Large Straight",
            score: 40,
          },

          yahtzee: {
            fieldType: FieldType.yahtzee,
            label: "Kadi",
            score: 50,
            maxYahtzees: 5,
          },

          chance: {
            fieldType: FieldType.number,
            label: "Chance",
          },
        },
      },
    },
  },
  {
    id: DEFAULT_RULESET,
    label: "Standard-Kadi-Regelwerk (de)",
    blocks: {
      top: {
        label: "Oben",
        hasBonus: true,
        bonusScore: 35,
        bonusFor: 63,
        cells: {
          aces: {
            fieldType: FieldType.multiplier,
            label: "Einser",
            multiplier: 1,
            maxMultiples: defaultDiceCount,
          },

          twos: {
            fieldType: FieldType.multiplier,
            label: "Zweier",
            multiplier: 2,
            maxMultiples: defaultDiceCount,
          },

          threes: {
            fieldType: FieldType.multiplier,
            label: "Dreier",
            multiplier: 3,
            maxMultiples: defaultDiceCount,
          },

          fours: {
            fieldType: FieldType.multiplier,
            label: "Vierer",
            multiplier: 4,
            maxMultiples: defaultDiceCount,
          },

          fives: {
            fieldType: FieldType.multiplier,
            label: "Fünfer",
            multiplier: 5,
            maxMultiples: defaultDiceCount,
          },

          sixes: {
            fieldType: FieldType.multiplier,
            label: "Sechser",
            multiplier: 6,
            maxMultiples: defaultDiceCount,
          },
        },
      },
      bottom: {
        label: "Unten",
        hasBonus: false,
        cells: {
          three_kind: {
            fieldType: FieldType.number,
            label: "Dreierpasch",
          },
          four_kind: {
            fieldType: FieldType.number,
            label: "Viererpasch",
          },
          full_house: {
            fieldType: FieldType.bool,
            label: "Full House",
            score: 25,
          },
          sml_straight: {
            fieldType: FieldType.bool,
            label: "Kleine Straße",
            score: 30,
          },
          lg_straight: {
            fieldType: FieldType.bool,
            label: "Große Straße",
            score: 40,
          },
          yahtzee: {
            fieldType: FieldType.yahtzee,
            label: "Kadi",
            score: 50,
            maxYahtzees: 5,
          },
          change: {
            fieldType: FieldType.number,
            label: "Chance",
          },
        },
      },
    },
  },
];

export function getGameSchemaById(schemaId: string): GameSchema {
  for (const schema of gameSchemas) {
    if (schema.id === schemaId) {
      return schema;
    }
  }
  throw new RangeError("No such GameSchema with id '" + schemaId + "'!");
}

export interface SchemaListing {
  id: string;
  label: string;
}

export function getSchemaListings(): SchemaListing[] {
  return gameSchemas.map((s) => ({ id: s.id, label: s.label }));
}
