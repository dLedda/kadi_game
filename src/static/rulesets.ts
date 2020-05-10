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
    blocks: BlockDef[];
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
    id: string;
    label: string;
    cells: CellDef[];
}

export type CellDef = BoolCellDef | MultiplierCellDef | NumberCellDef | YahtzeeCellDef;

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
    id: string;
    label: string;
}

// ----- Predefined sets
const defaultDiceCount = 5;

const gameSchemas: GameSchema[] = [
    {
        id: "default_en",
        label: "Standard Kadi Rules (en)",
        blocks: [
            {
                id: "top",
                label: "Upper",
                hasBonus: true,
                bonusScore: 35,
                bonusFor: 63,
                cells: [
                    {
                        id: "aces",
                        fieldType: FieldType.multiplier,
                        label: "Aces",
                        multiplier: 1,
                        maxMultiples: defaultDiceCount,
                    },
                    {
                        id: "twos",
                        fieldType: FieldType.multiplier,
                        label: "Twos",
                        multiplier: 2,
                        maxMultiples: defaultDiceCount,
                    },
                    {
                        id: "threes",
                        fieldType: FieldType.multiplier,
                        label: "Threes",
                        multiplier: 3,
                        maxMultiples: defaultDiceCount,
                    },
                    {
                        id: "fours",
                        fieldType: FieldType.multiplier,
                        label: "Fours",
                        multiplier: 4,
                        maxMultiples: defaultDiceCount,
                    },
                    {
                        id: "fives",
                        fieldType: FieldType.multiplier,
                        label: "Fives",
                        multiplier: 5,
                        maxMultiples: defaultDiceCount,
                    },
                    {
                        id: "sixes",
                        fieldType: FieldType.multiplier,
                        label: "Sixes",
                        multiplier: 6,
                        maxMultiples: defaultDiceCount,
                    }
                ]
            },
            {
                id: "bottom",
                label: "Lower",
                hasBonus: false,
                cells: [
                    {
                        id: "three_kind",
                        fieldType: FieldType.number,
                        label: "Three of a Kind",
                    },
                    {
                        id: "four_kind",
                        fieldType: FieldType.number,
                        label: "Four of a Kind",
                    },
                    {
                        id: "full_house",
                        fieldType: FieldType.bool,
                        label: "Full House",
                        score: 25,
                    },
                    {
                        id: "sml_straight",
                        fieldType: FieldType.bool,
                        label: "Small Straight",
                        score: 30,
                    },
                    {
                        id: "lg_straight",
                        fieldType: FieldType.bool,
                        label: "Large Straight",
                        score: 40,
                    },
                    {
                        id: "yahtzee",
                        fieldType: FieldType.yahtzee,
                        label: "Kadi",
                        score: 50,
                        maxYahtzees: 5,
                    },
                    {
                        id: "chance",
                        fieldType: FieldType.number,
                        label: "Chance",
                    }
                ]
            }
        ]
    },
    {
        id: "default_de",
        label: "Standard-Kadi-Regelwerk (de)",
        blocks: [
            {
                id: "top",
                label: "Oben",
                hasBonus: true,
                bonusScore: 35,
                bonusFor: 63,
                cells: [
                    {
                        id: "aces",
                        fieldType: FieldType.multiplier,
                        label: "Einser",
                        multiplier: 1,
                        maxMultiples: defaultDiceCount,
                    },
                    {
                        id: "twos",
                        fieldType: FieldType.multiplier,
                        label: "Zweier",
                        multiplier: 2,
                        maxMultiples: defaultDiceCount,
                    },
                    {
                        id: "threes",
                        fieldType: FieldType.multiplier,
                        label: "Dreier",
                        multiplier: 3,
                        maxMultiples: defaultDiceCount,
                    },
                    {
                        id: "fours",
                        fieldType: FieldType.multiplier,
                        label: "Vierer",
                        multiplier: 4,
                        maxMultiples: defaultDiceCount,
                    },
                    {
                        id: "fives",
                        fieldType: FieldType.multiplier,
                        label: "Fünfer",
                        multiplier: 5,
                        maxMultiples: defaultDiceCount,
                    },
                    {
                        id: "sixes",
                        fieldType: FieldType.multiplier,
                        label: "Sechser",
                        multiplier: 6,
                        maxMultiples: defaultDiceCount,
                    }
                ]
            },
            {
                id: "bottom",
                label: "Unten",
                hasBonus: false,
                cells: [
                    {
                        id: "three_kind",
                        fieldType: FieldType.number,
                        label: "Dreierpasch",
                    },
                    {
                        id: "four_kind",
                        fieldType: FieldType.number,
                        label: "Viererpasch",
                    },
                    {
                        id: "full_house",
                        fieldType: FieldType.bool,
                        label: "Full House",
                        score: 25,
                    },
                    {
                        id: "sml_straight",
                        fieldType: FieldType.bool,
                        label: "Kleine Straße",
                        score: 30,
                    },
                    {
                        id: "lg_straight",
                        fieldType: FieldType.bool,
                        label: "Große Straße",
                        score: 40,
                    },
                    {
                        id: "yahtzee",
                        fieldType: FieldType.yahtzee,
                        label: "Kadi",
                        score: 50,
                        maxYahtzees: 5,
                    },
                    {
                        id: "chance",
                        fieldType: FieldType.number,
                        label: "Chance",
                    }
                ]
            }
        ]
    }
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
    return gameSchemas.map(s => ({ id: s.id, label: s.label }));
}