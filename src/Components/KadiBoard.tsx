import React, {ReactElement, ReactNode, useContext} from "react";
import PlayerScoreCard, {CellLocation, PlayerScoreCardJSONRepresentation} from "../Classes/PlayerScoreCard";
import {GameSchema, getGameSchemaById} from "../static/rulesets";
import LocaleContext from "../LocaleContext";
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
import {Player} from "./Game";
import {SERVER_BASE_NAME} from "../index";


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
    players: Player[];
    showResults: boolean;
    savingGame: boolean;
    locked: boolean;
    saved: boolean;
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
            scoreSheet: this.generateNewScoreSheet(this.props.settings.players),
            players: this.props.settings.players,
            showResults: true,
            savingGame: false,
            locked: false,
            saved: false,
        };

        this.caretaker = new CaretakerSet(
            Settings.maxHistoryLength,
            ...this.state.players.map(
            player => this.state.scoreSheet[player.id]
            )
        );
    }

    private generateNewScoreSheet(players: Player[]): ScoreSheet {
        const scoreSheet: ScoreSheet = {};
        for (const player of players) {
            scoreSheet[player.id] = new PlayerScoreCard(player.id, this.gameSchema);
        }
        return scoreSheet;
    }

    private onCellEdit = (response: CellEventResponse): void => {
        if (!this.state.locked) {
            const newScoreSheet = this.state.scoreSheet;
            KadiBoard.updateScoreSheetFromCellResponse(newScoreSheet, response);
            this.setState({ scoreSheet: newScoreSheet });
            this.caretaker.save();
        }
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
        const JSONScoreCards: PlayerScoreCardJSONRepresentation[] = [];
        for (const playerId in this.state.scoreSheet) {
            JSONScoreCards.push(this.state.scoreSheet[playerId].getJSONRepresentation());
        }
        return JSON.stringify({
            ruleset: this.gameSchema.id,
            players: this.state.players,
            results: JSONScoreCards
        });
    }

    private canSave(): boolean {
        if (this.state.saved) {
            return false;
        }
        for (const playerId in this.state.scoreSheet) {
            if (!this.state.scoreSheet[playerId].filledOut()) {
                return false;
            }
        }
        return true;
    }

    private saveGame: () => void = async () => {
        this.setState({savingGame: true}, () => {
            axios.post(SERVER_BASE_NAME + "/api/games",
                this.getJSONRepresentationForBoard(),
                {headers: {"Content-Type": "application/json"}}
                )
                .then(response => this.onGameSave(response.data))
                .catch(error => this.onSaveError(error))
                .finally(() => this.setState({ savingGame: false }));
        });
    };

    private onGameSave = (serverResponse: string) => {
        this.setState({locked: true, saved: true});
    };

    private onSaveError = (error: any) => {
        console.log("Error saving:", error);
    };

    render(): ReactNode {
        const Locale = this.context.strings;
        const rows: ReactElement[] = [];

        for (const block in this.gameSchema.blocks) {
            const blockSchema = this.gameSchema.blocks[block];
            const scores: BlockScores = {subtotals: {}, bonuses: {}, totals: {}};
            for (const cell in blockSchema.cells) {
                scores[cell] = {};
            }
            this.state.players.forEach(player => {
                scores.totals[player.id] = this.getBlockTotalByPlayerId(block, player.id);
                scores.bonuses[player.id] = this.playerHasBonusForBlock(player.id, block);
                scores.subtotals[player.id] = this.getBlockSubtotalByPlayerId(block, player.id);
                for (const cell in blockSchema.cells) {
                    scores[cell][player.id] = this.getCellDisplayValueByPlayerIdAndLocation(
                        player.id, { blockId: block, cellId: cell});
                }
            });
            rows.push(
                <KadiBlockRenderer
                    key={"block" + block}
                    blockId={block}
                    blockSchema={blockSchema}
                    showResults={this.state.showResults}
                    onCellEdit={this.onCellEdit}
                    scores={scores}
                />
            );
        }

        const grandTotals: CellScores = {};
        this.state.players.forEach(player =>
            grandTotals[player.id] = this.getTotalForPlayer(player.id)
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
                            <th colSpan={this.state.players.length + 1}>
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
                        <ColumnHeadersRow playerNames={this.state.players.map(player => player.nick)} />
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
                            {this.state.saved ?
                                Locale.buttons.saveGameButton.gameSaved :
                                Locale.buttons.saveGameButton.saveGame}
                        </Button>
                    </div>
                </Container>
            </div>
        );
    }
}

KadiBoard.contextType = LocaleContext;

interface ColumnHeadersRowProps {
    playerNames: string[];
}

const ColumnHeadersRow: React.FunctionComponent<ColumnHeadersRowProps> = ({ playerNames }) => {
    const Locale = useContext(LocaleContext).strings;

    const columnHeaders: ReactNode[] = [(
        <td className="topLeftBlankCell" key={"blank_header"}>
            {Locale.headers.rowLabels}
        </td>
    )];
    for (const playerId of playerNames) {
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
