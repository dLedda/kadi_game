import {CellFlag, FieldType} from "../static/enums";
import {BoolCellDef, CellDef, MultiplierCellDef, NumberCellDef, YahtzeeCellDef} from "../static/rulesets"

export const createCellFromDef = (cellDef: CellDef) : ScoreCell => {
    switch (cellDef.fieldType) {
        case FieldType.number:
            return new NumberScoreCell(cellDef);
        case FieldType.bool:
            return new BoolScoreCell(cellDef);
        case FieldType.multiplier:
            return new MultiplierScoreCell(cellDef);
        case FieldType.yahtzee:
            return new YahtzeeScoreCell(cellDef);
    }
};

export type ScoreCellValue = number | boolean;

export interface CellState {
    id: string;
    struck: boolean;
    value: number | boolean;
    currentIteratorIndex?: number;
}

export interface ScoreCellJSONRepresentation {
    id: string;
    value: number | boolean | CellFlag.strike;
}

abstract class ScoreCell {
    protected readonly id: string;
    protected static readonly fieldType: FieldType;
    protected struck: boolean;
    protected value: number | boolean;

    protected constructor(cellDef: CellDef) {
        this.id = cellDef.id;
        this.struck = false;
        this.value = 0;
    }

    abstract getScore(): number;

    abstract update(value: ScoreCellValue | CellFlag): void;

    isStruck(): boolean {
        return this.struck;
    }

    protected unstrike(): void {
        this.struck = false;
    }

    strike(): void {
        this.struck = true;
    }

    getId(): string {
        return this.id;
    }

    getState(): CellState {
        const state: CellState = {
            id: this.id,
            struck: this.struck,
            value: this.value
        };
        return Object.assign({}, state);
    }

    restoreFromState(cellState: CellState): void {
        this.struck = cellState.struck;
        this.value = cellState.value;
    }

    filledOut(): boolean {
        return this.value > 0 || this.isStruck();
    }

    getJSONRepresentation(): ScoreCellJSONRepresentation {
        return { id: this.id, value: this.isStruck() ? CellFlag.strike : this.value };
    }
}

type IterableSequenceValues = boolean | number | CellFlag.strike;

abstract class IterableScoreCell extends ScoreCell {
    protected iteratedSequence: IterableSequenceValues[];
    protected currentIteratorIndex: number;

    protected constructor(cellDef: CellDef) {
        super(cellDef);
        this.iteratedSequence = [];
        this.currentIteratorIndex = 0;
    }

    update(value: ScoreCellValue | CellFlag): void {
        if (value == CellFlag.strike) {
            this.strike();
        }
        else if (this.struck) {
            this.unstrike();
        }
        else {
            this.iterate();
        }
    }

    getState(): CellState {
        const state: CellState = {
            id: this.id,
            struck: this.struck,
            value: this.value,
            currentIteratorIndex: this.currentIteratorIndex
        };
        return Object.assign({}, state);
    }

    restoreFromState(state: CellState): void {
        this.struck = state.struck;
        this.value = state.value;
        this.currentIteratorIndex = state.currentIteratorIndex as number;
    }

    private iterate(): void {
        if (this.inIteratorBounds(this.currentIteratorIndex + 1)) {
            this.currentIteratorIndex++;
        }
        else {
            this.currentIteratorIndex = 0;
        }
        this.setValueFromIterator();
    }

    private inIteratorBounds(index: number): boolean {
        const outsideBounds: boolean = index < 0 || index >= this.iteratedSequence.length;
        return !outsideBounds;
    }

    private setValueFromIterator(): void {
        const valueAtIteratorIndex = this.iteratedSequence[this.currentIteratorIndex];
        if (this.isStruck()) {
            this.unstrike();
        }
        if (valueAtIteratorIndex == CellFlag.strike) {
            this.strike();
        }
        else {
            this.value = valueAtIteratorIndex;
        }
    }
}


class NumberScoreCell extends ScoreCell {
    protected static readonly fieldType = FieldType.number;

    constructor(cellDef: NumberCellDef) {
        super(cellDef);
        this.value = 0;
    }

    getScore(): number {
        return this.value as number;
    }

    update(value: ScoreCellValue | CellFlag): void {
        switch (value){
            case CellFlag.strike:
                this.strike();
                break;
            case CellFlag.unstrike:
                this.unstrike();
                break;
            default:
                this.value = value;
                break;
        }
    }
}

class BoolScoreCell extends IterableScoreCell {
    protected static readonly fieldType = FieldType.bool;
    private readonly score: number;
    protected value: boolean;

    constructor(cellDef: BoolCellDef) {
        super(cellDef);
        this.score = cellDef.score;
        this.value = false;
        this.iteratedSequence = [false, true];
    }

    getScore(): number {
        if (this.value && !this.isStruck()) {
            return this.score;
        }
        else {
            return 0;
        }
    }
}

class YahtzeeScoreCell extends IterableScoreCell {
    protected static readonly fieldType = FieldType.yahtzee;
    private readonly score: number;
    protected value: number;

    constructor(cellDef: YahtzeeCellDef) {
        super(cellDef);
        this.score = cellDef.score;
        this.value = 0;

        for (let i = 0; i <= cellDef.maxYahtzees; i++) {
            this.iteratedSequence.push(i);
        }
    }

    getScore(): number {
        if (this.isStruck()) {
            return 0;
        }
        else {
            return this.score * this.value;
        }
    }
}

class MultiplierScoreCell extends IterableScoreCell {
    protected static readonly fieldType = FieldType.multiplier;
    protected readonly multiplier: number;
    protected value: number;

    constructor(cellDef: MultiplierCellDef) {
        super(cellDef);
        this.multiplier = cellDef.multiplier;
        this.value = 0;

        for (let i = 0; i <= cellDef.maxMultiples; i++) {
            this.iteratedSequence.push(i);
        }
    }

    getScore(): number {
        if (this.isStruck()) {
            return 0;
        }
        else {
            return this.multiplier * this.value;
        }
    }
}

export default ScoreCell;