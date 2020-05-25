import React, {ChangeEvent, FocusEvent, KeyboardEvent, ReactNode} from "react";
import {getSchemaListings, SchemaListing} from "../static/rulesets";
import LocaleContext from "../LocaleContext";
import {Button} from "semantic-ui-react";
import {Player} from "./Game";

interface GameSetupProps {
    onSetupComplete: (settings: GameSettings) => void;
    settings: GameSettings;
    availablePlayers: Player[];
}

interface GameSetupState {
    selectedRuleset: string;
    enteredPlayers: Player[];
    editingPlayerName: boolean;
}

export interface GameSettings {
    ruleset: string;
    players: Player[];
}

class GameSetup extends React.Component<GameSetupProps, GameSetupState> {
    private readonly availableRulesets: SchemaListing[];
    private changeLang: (lang: string) => void;
    state: GameSetupState;
    constructor(props: GameSetupProps) {
        super(props);

        this.availableRulesets = getSchemaListings();
        this.changeLang = () => {};
        this.state = {
            selectedRuleset: this.props.settings.ruleset,
            enteredPlayers: this.props.settings.players,
            editingPlayerName: false,
        };
    }

    onRulesetChange: (ruleset: string) => void = (ruleset) => {
        this.setState({ selectedRuleset: ruleset });
    };

    removePlayer: (index: number) => void = (index) => {
        const newPlayers = this.state.enteredPlayers.slice();
        newPlayers.splice(index, 1);
        this.setState({enteredPlayers: newPlayers});
    };

    addPlayer: (playerSubmission: string, keepEditing: boolean) => void = (playerSubmission, keepEditing) => {
        const newPlayers = this.state.enteredPlayers.slice();
        if (!this.alreadyPlaying(playerSubmission)) {
            newPlayers.push({
                id: this.playerNameToId(playerSubmission) ?? playerSubmission,
                nick: playerSubmission
            });
        }
        this.setState({enteredPlayers: newPlayers, editingPlayerName: keepEditing});
    };

    alreadyPlaying(playerName: string): boolean {
        return !!this.state.enteredPlayers.find(player => player.nick === playerName);
    }

    playerNameToId(playerName: string): string | undefined {
        return this.props.availablePlayers.find(player => player.nick === playerName)?.id;
    }

    playerIsNew(player: Player) {
        return player.id === player.nick;
    }

    submitSettings: () => void = () => {
        this.props.onSetupComplete({
            ruleset: this.state.selectedRuleset,
            players: this.state.enteredPlayers,
        });
    };

    render(): ReactNode {
        const Locale = this.context.strings;

        const rulesetOptions: ReactNode[] = [];
        for (const rulesetListing of this.availableRulesets) {
            let className = "option";
            if (this.state.selectedRuleset === rulesetListing.id) {
                className += " selected";
            }
            rulesetOptions.push((
                <div
                    key={rulesetListing.id + "ruleset_option"}
                    className={className}
                    onClick={() => this.onRulesetChange(rulesetListing.id)}
                >
                    {rulesetListing.label}
                    <span className={"selectorBox"}/>
                </div>
            ));
        }

        const playerListing: ReactNode[] = [];
        for (let i = 0; i < this.state.enteredPlayers.length; i++) {
            playerListing.push((
                <ActivePlayerListItem
                    key={i}
                    playerIsNew={this.playerIsNew(this.state.enteredPlayers[i])}
                    removePlayer={() => this.removePlayer(i)}
                    playerName={this.state.enteredPlayers[i].nick}
                />
            ));
        }
        playerListing.push((
            <AddPlayerField
                playersListEmpty={playerListing.length === 0}
                submitNewPlayer={this.addPlayer}
                userEditing={this.state.editingPlayerName}
                availablePlayers={this.props.availablePlayers}
            />
        ));

        return (
            <div className={"gameSetup"}>
                <div className={"setupFormContainer"}>
                    <div className={"setupForm"}>
                        <div className={"optionGroup"}>
                            <div className={"optionGroupTitleContainer"}>
                                <span className={"optionGroupTitle"}>
                                    {Locale.setupScreen.players}
                                </span>
                            </div>
                            <div className={"playerList optionList"}>
                                {playerListing}
                            </div>
                        </div>
                        <div className={"optionGroup"}>
                            <div className={"optionGroupTitleContainer"}>
                                <span className={"optionGroupTitle"}>
                                    {Locale.setupScreen.selectRuleset}
                                </span>
                            </div>
                            <div className={"rulesetOptions optionList"}>
                                {rulesetOptions}
                            </div>
                        </div>
                        <div className={"playButtonContainer"}>
                            <Button
                                size={"huge"}
                                color={"blue"}
                                onClick={this.submitSettings}
                                disabled={this.state.enteredPlayers.length < 1}
                            >
                                {Locale.setupScreen.startGame}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
GameSetup.contextType = LocaleContext;

interface AddPlayerFieldProps {
    playersListEmpty: boolean;
    submitNewPlayer: (name: string, keepEditing: boolean) => void;
    userEditing: boolean;
    availablePlayers: Player[];
}

const AddPlayerField: React.FunctionComponent<AddPlayerFieldProps> = (props) => {
    const {playersListEmpty, submitNewPlayer, userEditing, availablePlayers} = props;
    const Locale = React.useContext(LocaleContext).strings;

    const [beingEdited, updateBeingEdited] = React.useState(false);
    const [currentEditValue, updateCurrentEditValue] = React.useState("");

    const placeholderText = playersListEmpty ?
        Locale.setupScreen.noPlayersEntered :
        Locale.setupScreen.clickToAddPlayer;
    const displayText = beingEdited ? currentEditValue : placeholderText;

    const handleFocus = () => {
        updateBeingEdited(true);
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        updateCurrentEditValue(e.target.value);
    };

    const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
        attemptPlayerSubmit(e.target.value, false);
        updateBeingEdited(false);
    };

    const handleKeyUp = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            attemptPlayerSubmit(e.currentTarget.value, true);
        }
    };

    const attemptPlayerSubmit = (input: string, keepEditing: boolean) => {
        if (input !== "") {
            submitNewPlayer(input, keepEditing);
            updateCurrentEditValue("");
        }
    };

    return (
        <div
            key={"noplayer_list"}
            className={"option playerOption inputPlayerField" + (beingEdited ? "" : " faded")}
        >
            <input
                type={"text"}
                value={displayText}
                autoFocus={userEditing}
                onFocus={handleFocus}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyUp={handleKeyUp}
            />
        </div>
    );
};

interface ActivePlayerListItemProps {
    removePlayer: () => any;
    playerName: string;
    playerIsNew: boolean;
}

const ActivePlayerListItem: React.FunctionComponent<ActivePlayerListItemProps> = (props) => {
    const {removePlayer, playerName, playerIsNew} = props;
    const Locale = React.useContext(LocaleContext).strings;
    return (
        <>
            <div
                className={"option playerOption"}
            >
                <div className={"playerText"}>
                    {playerName}
                    {playerIsNew &&
                        <span className={"newPlayerText"}>
                            {Locale.setupScreen.playerNew}
                        </span>
                    }
                </div>
                <div
                    className={"trashButton"}
                    onClick={removePlayer}
                />
            </div>
        </>
    );
};

export default GameSetup;