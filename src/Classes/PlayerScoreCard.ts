import {ScoreCellValue} from "./ScoreCell";
import ScoreBlock, {createBlockFromDef, BlockState, ScoreBlockJSONRepresentation} from "./ScoreBlock";
import {BlockDef, GameSchema} from "../static/rulesets";
import { Memento, Originator } from "./Caretaker";
import {CellFlag} from "../static/enums";

export type CellLocation = { blockId: string, cellId: string };

class PlayerScoreCard implements Originator {
    private readonly playerId: string;
    private readonly blocks: ScoreBlock[];

    constructor(playerId: string, gameSchema: GameSchema) {
        this.playerId = playerId;
        this.blocks = PlayerScoreCard.generateBlocks(gameSchema.blocks);
    }

    private static generateBlocks(blockDefs: BlockDef[]): ScoreBlock[] {
        const blocks = [];
        for (const blockDef of blockDefs) {
            blocks.push(createBlockFromDef(blockDef));
        }
        return blocks;
    }

    getTotal(): number {
        let playerTotal = 0;
        for (const block of this.blocks) {
            playerTotal += block.getTotal();
        }
        return playerTotal;
    }

    getBlockTotalById(blockId: string): number {
        return this.getBlockById(blockId).getTotal();
    }

    getBlockSubTotalById(blockId: string): number {
        return this.getBlockById(blockId).getSubtotal();
    }

    blockWithIdHasBonus(blockId: string): boolean {
        return this.getBlockById(blockId).bonusAttained();
    }

    updateCellByLocationWithValue(loc: CellLocation, value: ScoreCellValue | CellFlag): void {
        this.getBlockById(loc.blockId).updateCellByIdWithValue(loc.cellId, value);
    }

    getCellScoreByLocation(loc: CellLocation): number {
        return this.getBlockById(loc.blockId).getCellScoreById(loc.cellId);
    }

    cellAtLocationIsStruck(loc: CellLocation): boolean {
        return this.getBlockById(loc.blockId).cellWithIdIsStruck(loc.cellId);
    }

    getSnapshot(): Memento {
        return new PlayerScoreCardMemento(this.getState());
    }

    private getState(): PlayerScoreCardState {
        const state: PlayerScoreCardState = {
            blocks: []
        };
        state.blocks = this.blocks.map(block => block.getState());
        return state;
    }

    restoreSnapshot(snapshot: PlayerScoreCardMemento): void {
        const state = snapshot.getState();
        state.blocks.forEach(block => {
            const correspondingBlock = this.getBlockById(block.id);
            correspondingBlock.restoreCellsFromStates(block.cellStates);
        });
    }

    private getBlockById(blockId: string): ScoreBlock {
        const foundScoreBlock = this.blocks.find(block => block.getId() === blockId);
        if (foundScoreBlock !== undefined) {
            return foundScoreBlock;
        }
        else {
            throw new Error("ScoreBlock with ID " + blockId + " not found for player" + this.playerId + "!")
        }
    }

    filledOut(): boolean {
        for (const block in this.blocks) {
            if (!this.blocks[block].filledOut()) {
                return false;
            }
        }
        return true;
    }

    getJSONRepresentation(): PlayerScoreCardJSONRepresentation {
        const JSONRepresentation: PlayerScoreCardJSONRepresentation = {
            playerId: this.playerId,
            blocks: []
        };
        this.blocks.forEach(block => JSONRepresentation.blocks.push(block.getJSONRepresentation()));
        return JSONRepresentation;
    }
}

interface PlayerScoreCardState {
    blocks: BlockState[];
}

export interface PlayerScoreCardJSONRepresentation {
    playerId: string;
    blocks: ScoreBlockJSONRepresentation[];
}

class PlayerScoreCardMemento implements Memento {
    private readonly state: PlayerScoreCardState;

    constructor(state: PlayerScoreCardState) {
        this.state = state;
    }

    getState(): PlayerScoreCardState {
        return this.state;
    }
}

export default PlayerScoreCard;