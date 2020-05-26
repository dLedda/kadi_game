import ScoreCell, {
    createCellFromDef,
    ScoreCellValue,
    CellState,
    ScoreCellJSONRepresentation
} from "./ScoreCell";
import {CellDef, BlockDef, BonusBlockDef, NoBonusBlockDef } from "../static/rulesets";
import {CellFlag} from "../static/enums";

export const createBlockFromDef = (blockId: string, blockDef: BlockDef) : ScoreBlock => {
    if (blockDef.hasBonus) {
        return new ScoreBlockWithBonus(blockId, blockDef);
    }
    else {
        return new ScoreBlockNoBonus(blockId, blockDef);
    }
};

export interface BlockState {
    id: string;
    cellStates: CellState[];
}

export interface ScoreBlockJSONRepresentation {
    id: string;
    cells: ScoreCellJSONRepresentation[];
}

abstract class ScoreBlock {
    protected cells: ScoreCell[];
    protected id: string;

    protected constructor(blockId: string, blockDef: BlockDef) {
        this.cells = ScoreBlock.generateCells(blockDef.cells);
        this.id = blockId;
    }

    private static generateCells(cellDefs: Record<string, CellDef>): ScoreCell[] {
        const cells = [];
        for (const cellId in cellDefs) {
            cells.push(createCellFromDef(cellId, cellDefs[cellId]));
        }
        return cells;
    }

    abstract getTotal(): number;

    abstract bonusAttained(): boolean;

    getSubtotal(): number {
        let blockScore = 0;
        for (const cell of this.cells) {
            blockScore += cell.getScore();
        }
        return blockScore;
    }

    updateCellByIdWithValue(cellId: string, value: ScoreCellValue | CellFlag): void {
        this.getCellById(cellId).update(value);
    }

    getCellScoreById(cellId: string): number {
        return this.getCellById(cellId).getScore();
    }

    cellWithIdIsStruck(cellId: string): boolean {
        return this.getCellById(cellId).isStruck();
    }

    private getCellById(cellId: string): ScoreCell {
        const foundScoreCell = this.cells.find(cell => cell.getId() === cellId);
        if (foundScoreCell !== undefined) {
            return foundScoreCell;
        }
        else {
            throw new Error("ScoreCell with ID " + cellId + " not found in block with ID " + this.id + "!")
        }
    }

    getId(): string {
        return this.id;
    }

    getState(): BlockState {
        const state: BlockState = {
            id: this.id,
            cellStates: []
        };
        state.cellStates = this.cells.map(cell => cell.getState());
        return Object.assign({}, state);
    }

    restoreCellsFromStates(cellStates: CellState[]): void {
        cellStates.forEach(cellState => {
            const correspondingCell = this.getCellById(cellState.id);
            correspondingCell.restoreFromState(cellState);
        })
    }

    filledOut(): boolean {
        for (const cell in this.cells) {
            if (!this.cells[cell].filledOut()) {
                return false;
            }
        }
        return true;
    }

    getJSONRepresentation(): ScoreBlockJSONRepresentation {
        const JSONRepresentation: ScoreBlockJSONRepresentation = {
            id: this.id,
            cells: []
        };
        this.cells.forEach(cell => JSONRepresentation.cells.push(cell.getJSONRepresentation()));
        return JSONRepresentation;
    }
}

class ScoreBlockWithBonus extends ScoreBlock {
    protected readonly bonus: number;
    protected readonly bonusFor: number;

    constructor(blockId: string, blockDef: BonusBlockDef) {
        super(blockId, blockDef);
        this.bonus = blockDef.bonusScore;
        this.bonusFor = blockDef.bonusFor;
    }

    getTotal(): number {
        const prelimScore = this.getSubtotal();
        return prelimScore >= this.bonusFor ? prelimScore + this.bonus : prelimScore;
    }

    bonusAttained(): boolean {
        return this.getSubtotal() >= this.bonusFor;
    }
}

class ScoreBlockNoBonus extends ScoreBlock {
    constructor(blockId: string, blockDef: NoBonusBlockDef) {
        super(blockId, blockDef);
    }

    getTotal(): number {
        return this.getSubtotal();
    }

    bonusAttained(): boolean {
        return false;
    }
}

export default ScoreBlock;