import React, {ReactElement, ReactNode, useContext} from "react";
import PlayerScoreCard, {CellLocation, PlayerScoreCardJSONRepresentation} from "../Classes/PlayerScoreCard";
import {BlockDef, GameSchema, getGameSchemaById} from "../static/rulesets";
import {formatUnicorn, LocaleContext} from "../static/strings";
import {CellFlag} from "../static/enums";
import {ScoreCellValue} from "../Classes/ScoreCell";
import {CaretakerSet} from "../Classes/Caretaker";
import {GameSettings} from "./GameSetup";
import Settings from "../static/settings.json";
import axios from "axios";
import {Button, Container, Header, Icon, Image} from "semantic-ui-react";
import logo from "../static/images/kadi.png";
import KadiGrandTotalRow from "./KadiGrandTotalRow";
import KadiBlockRenderer from "./KadiBlockRenderer";
import {KadiCellDisplayValue} from "./KadiCell";


export interface CellScores {
    [key: string]: KadiCellDisplayValue;
}

export interface BlockScores {
    [key: string]: CellScores;
    bonuses: CellScores;
    subtotals: CellScores;
    totals: CellScores;
}

export interface CellEventResponse {
    value: ScoreCellValue | CellFlag;
    playerId: string;
    location: CellLocation;
}

export interface KadiBoardProps {
    settings: GameSettings;
    returnToSetup: () => void;
}

interface KadiBoardState {
    scoreSheet: ScoreSheet;
    playerIds: string[];
    showResults: boolean;
    savingGame: boolean;
}

interface ScoreSheet {
    [key: string]: PlayerScoreCard;
}

class KadiBoard extends React.Component<KadiBoardProps, KadiBoardState> {
    private readonly gameSchema: GameSchema;
    private readonly caretaker: CaretakerSet;
    state: KadiBoardState;

    constructor(props: KadiBoardProps) {
        super(props);

        this.gameSchema = getGameSchemaById(this.props.settings.ruleset);

        this.state = {
            scoreSheet: this.generateNewScoreSheet(this.props.settings.playerIds),
            playerIds: this.props.settings.playerIds,
            showResults: true,
            savingGame: false,
        };

        this.caretaker = new CaretakerSet(
            Settings.maxHistoryLength,
            ...this.state.playerIds.map(
            pid => this.state.scoreSheet[pid]
            )
        );
    }

    private generateNewScoreSheet(playerIds: string[]): ScoreSheet {
        const scoreSheet: ScoreSheet = {};
        for (const playerId of playerIds) {
            scoreSheet[playerId] = new PlayerScoreCard(playerId, this.gameSchema);
        }
        return scoreSheet;
    }

    private onCellEdit = (response: CellEventResponse): void => {
        const newScoreSheet = this.state.scoreSheet;
        KadiBoard.updateScoreSheetFromCellResponse(newScoreSheet, response);
        this.setState({ scoreSheet: newScoreSheet });
        this.caretaker.save();
    };

    private static updateScoreSheetFromCellResponse(scoreSheet: ScoreSheet, response: CellEventResponse): void {
        const playerScoreCard = scoreSheet[response.playerId];
        playerScoreCard.updateCellByLocationWithValue(response.location, response.value);
    }

    toggleShowResults = () => {
        this.setState({ showResults: !this.state.showResults });
    };

    private getCellDisplayValueByPlayerIdAndLocation(playerId: string, location: CellLocation): KadiCellDisplayValue {
        const playerSheet = this.state.scoreSheet[playerId];
        let cellValue: KadiCellDisplayValue = playerSheet.getCellScoreByLocation(location);
        cellValue = playerSheet.cellAtLocationIsStruck(location) ? CellFlag.strike : cellValue;
        return cellValue;
    };

    private getBlockSubtotalByPlayerId(blockId: string, playerId: string): number {
        return this.state.scoreSheet[playerId].getBlockSubTotalById(blockId);
    }

    private getBlockTotalByPlayerId(blockId: string, playerId: string): number {
        return this.state.scoreSheet[playerId].getBlockTotalById(blockId);
    }

    private getTotalForPlayer(playerId: string): number {
        return this.state.scoreSheet[playerId].getTotal();
    }

    private playerHasBonusForBlock(playerId: string, blockId: string): boolean {
        return this.state.scoreSheet[playerId].blockWithIdHasBonus(blockId);
    }

    private undo(): void {
        this.caretaker.undo();
        this.forceUpdate();
    }

    private redo(): void {
        this.caretaker.redo();
        this.forceUpdate();
    }

    private getJSONRepresentationForBoard(): string {
        const JSONRepresentation: PlayerScoreCardJSONRepresentation[] = [];
        for (const playerId in this.state.scoreSheet) {
            JSONRepresentation.push(this.state.scoreSheet[playerId].getJSONRepresentation());
        }
        return JSON.stringify(JSONRepresentation);
    }

    private canSave(): boolean {
        for (const playerId in this.state.scoreSheet) {
            if (!this.state.scoreSheet[playerId].filledOut()) {
                return false;
            }
        }
        return true;
    }

    private saveGame: () => void = async () => {
        this.setState({savingGame: true});
        axios.post(Settings.rootUrl + "/api/savegame",
            this.getJSONRepresentationForBoard(),
            {headers: {"Content-Type": "application/json"}}
            )
            .then(response => this.onGameSave(response.data))
            .catch(error => this.onSaveError(error))
            .finally(() => this.setState({ savingGame: false }));
    };

    private onGameSave = (serverResponse: string) => {
        console.log("Response:", serverResponse);
    };

    private onSaveError = (error: any) => {
        console.log("Error saving:", error);
    };

    render(): ReactNode {
        const Locale = this.context.strings;
        const rows: ReactElement[] = [];

        for (const block of this.gameSchema.blocks) {
            const scores: BlockScores = {subtotals: {}, bonuses: {}, totals: {}};
            for (const cell of block.cells) {
                scores[cell.id] = {};
            }
            this.state.playerIds.forEach(pid => {
                scores.totals[pid] = this.getBlockTotalByPlayerId(block.id, pid);
                scores.bonuses[pid] = this.playerHasBonusForBlock(pid, block.id);
                scores.subtotals[pid] = this.getBlockSubtotalByPlayerId(block.id, pid);
                for (const cell of block.cells) {
                    scores[cell.id][pid] = this.getCellDisplayValueByPlayerIdAndLocation(
                        pid, { blockId: block.id, cellId: cell.id });
                }
            });
            rows.push(
                <KadiBlockRenderer
                    key={"block" + block.id}
                    blockSchema={block}
                    showResults={this.state.showResults}
                    onCellEdit={this.onCellEdit}
                    scores={scores}
                />
            );
        }

        const grandTotals: CellScores = {};
        this.state.playerIds.forEach(pid =>
            grandTotals[pid] = this.getTotalForPlayer(pid)
        );
        rows.push(
            <KadiGrandTotalRow
                key={"grandTotalRow"}
                showResults={this.state.showResults}
                scores={grandTotals}
                toggleShowResults={this.toggleShowResults}
            />
        );

        return (
            <div className="game">
                <table className="kadiTable">
                    <thead>
                        <tr>
                            <th colSpan={this.state.playerIds.length + 1}>
                                <Header inverted={true} >
                                    <Image spaced={true} size={"small"} src={logo} />
                                    <Header.Content>
                                        <span className={"brandname"}>K&nbsp;&nbsp;A&nbsp;&nbsp;D&nbsp;&nbsp;I</span>
                                    </Header.Content>
                                </Header>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <ColumnHeadersRow playerIds={this.state.playerIds} />
                        {rows}
                    </tbody>
                </table>
                <Container>
                    <div className="buttonContainer">
                        <Button.Group>
                            <Button
                                secondary={true}
                                disabled={!this.caretaker.undosLeft()}
                                onClick={() => this.undo()}
                            >
                                <Icon name={"undo"} />
                                {Locale.buttons.undoButton}
                            </Button>
                            <Button
                                secondary={true}
                                disabled={!this.caretaker.redosLeft()}
                                onClick={() => this.redo()}
                            >
                                <Icon name={"redo"} />
                                {Locale.buttons.redoButton}
                            </Button>
                        </Button.Group>
                    </div>
                    <div className="buttonContainer">
                        <Button
                            icon={true}
                            labelPosition={"left"}
                            secondary={true}
                            onClick={() => this.props.returnToSetup()}
                        >
                            <Icon name={"arrow alternate circle left"}/>
                            {Locale.buttons.returnToSetupButton}
                        </Button>
                        <Button
                            icon={true}
                            labelPosition={"left"}
                            primary={true}
                            disabled={!this.canSave()}
                            onClick={() => this.saveGame()}
                            loading={this.state.savingGame}
                        >
                            <Icon name={"save"} />
                            {Locale.buttons.saveGameButton}
                        </Button>
                    </div>
                </Container>
            </div>
        );
    }
}

KadiBoard.contextType = LocaleContext;

interface ColumnHeadersRowProps {
    playerIds: string[];
}

const ColumnHeadersRow: React.FunctionComponent<ColumnHeadersRowProps> = ({ playerIds }) => {
    const Locale = useContext(LocaleContext).strings;

    const columnHeaders: ReactNode[] = [(
        <td className="topLeftBlankCell" key={"blank_header"}>
            {Locale.headers.rowLabels}
        </td>
    )];
    for (const playerId of playerIds) {
        columnHeaders.push(
            <td className="playerNameCell" key={"header" + playerId}>
                {playerId}
            </td>
        );
    }
    return (
        <tr className="columnHeaderRow">
            {columnHeaders}
        </tr>
    );
};

export default KadiBoard;
