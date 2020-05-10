import React, {ChangeEvent, FocusEvent, KeyboardEvent, ReactNode} from "react";
import {getSchemaListings, SchemaListing} from "../static/rulesets";
import {LocaleContext, LanguageNames} from "../static/strings";
import {SupportedLang} from "../static/enums";

class GameSetup extends React.Component<GameSetupProps, GameSetupState> {
    private readonly availableRulesets: SchemaListing[];
    private changeLang: (lang: string) => void;
    state: GameSetupState;

    constructor(props: GameSetupProps) {
        super(props);

        this.availableRulesets = getSchemaListings();
        this.changeLang = () => {};
        this.state = {
            selectedLang: this.props.settings.lang,
            selectedRuleset: this.props.settings.ruleset,
            enteredPlayerIds: this.props.settings.playerIds,
            editingPlayerName: false,
        };
    }

    componentDidMount(): void {
        this.changeLang = this.context.changeLang;
    }

    onLanguageChange: (lang: SupportedLang) => void = (lang) => {
        this.setState({ selectedLang: lang });
        this.changeLang(lang);
    };

    onRulesetChange: (ruleset: string) => void = (ruleset) => {
        this.setState({ selectedRuleset: ruleset });
    };

    removePlayer: (index: number) => void = (index) => {
        const newPlayers = this.state.enteredPlayerIds.slice();
        newPlayers.splice(index, 1);
        this.setState({enteredPlayerIds: newPlayers});
    };

    addPlayer: (playerSubmission: string, keepEditing: boolean) => void = (playerSubmission, keepEditing) => {
        const newPlayers = this.state.enteredPlayerIds.slice();
        if (!newPlayers.find(enteredPlayer => enteredPlayer == playerSubmission)) {
            newPlayers.push(playerSubmission);
        }
        this.setState({enteredPlayerIds: newPlayers, editingPlayerName: keepEditing});
    };

    submitSettings: () => void = () => {
        this.props.onSetupComplete({
            ruleset: this.state.selectedRuleset,
            playerIds: this.state.enteredPlayerIds,
            lang: this.state.selectedLang,
        });
    };

    render(): ReactNode {
        const Locale = this.context.strings;

        const langOptions: ReactNode[] = [];
        for (const lang in SupportedLang) {
            let className = "option";
            if (this.state.selectedLang === lang) {
                className += " selected";
            }
            langOptions.push((
                <div
                    key={lang + "lang_option"}
                    className={className}
                    onClick={() => this.onLanguageChange(lang as SupportedLang)}
                >
                    {LanguageNames[lang as SupportedLang]}
                    <span className={"selectorBox"}/>
                </div>
            ));
        }

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
        for (let i = 0; i < this.state.enteredPlayerIds.length; i++) {
            const playerName = this.state.enteredPlayerIds[i];
            playerListing.push((
                <div
                    key={playerName + "_list"}
                    className={"option playerOption"}
                >
                    {playerName}
                    <span
                        className={"trashButton"}
                        onClick={() => this.removePlayer(i)}
                    />
                </div>
            ));
        }
        playerListing.push((
            <AddPlayerField
                playersListEmpty={playerListing.length === 0}
                submitNewPlayer={this.addPlayer}
                userEditing={this.state.editingPlayerName}
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
                        <div className={"optionGroup"}>
                            <div className={"optionGroupTitleContainer"}>
                                <span className={"optionGroupTitle"}>
                                    {Locale.setupScreen.selectLanguage}
                                </span>
                            </div>
                            <div className={"languageOptions optionList"}>
                                {langOptions}
                            </div>
                        </div>
                        <div className={"playButtonContainer"}>
                            <button
                                className={"playButton"}
                                onClick={this.submitSettings}
                                disabled={this.state.enteredPlayerIds.length < 1}
                            >
                                {Locale.setupScreen.startGame}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
GameSetup.contextType = LocaleContext;

interface GameSetupProps {
    onSetupComplete: (settings: GameSettings) => void;
    settings: GameSettings;
}

interface GameSetupState {
    selectedLang: SupportedLang;
    selectedRuleset: string;
    enteredPlayerIds: string[];
    editingPlayerName: boolean;
}

export interface GameSettings {
    ruleset: string;
    playerIds: string[];
    lang: SupportedLang;
}

const AddPlayerField: React.FunctionComponent<AddPlayerFieldProps> = ({playersListEmpty, submitNewPlayer, userEditing}) => {
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

interface AddPlayerFieldProps {
    playersListEmpty: boolean;
    submitNewPlayer: (name: string, keepEditing: boolean) => void;
    userEditing: boolean;
}

export default GameSetup;