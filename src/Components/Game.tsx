import React, {ReactNode} from "react";
import "../static/css/game.css";
import KadiBoard from "./KadiBoard";
import GameSetup, {GameSettings} from "./GameSetup"
import Settings from "../static/settings.json";
import {SupportedLang} from "../static/enums";

interface GameState {
    currentSettings: GameSettings;
    settingUp: boolean;
}

interface GameProps {}

class Game extends React.Component<GameProps, GameState> {
    state: GameState;

    constructor(props: GameProps) {
        super(props);

        const startupSettings: GameSettings = {
            playerIds: Settings.players,
            ruleset: Settings.ruleset,
        };

        this.state = {
            currentSettings: startupSettings,
            settingUp: true,
        };
    }

    onSetupComplete: (gameSettings: GameSettings) => void = (gameSettings) => {
        this.setState({
            currentSettings: gameSettings,
            settingUp: false
        });
    };

    returnToSetup: () => void = () => {
        this.setState({settingUp: true});
    };

    render(): ReactNode {
        return (
            <>
                {this.state.settingUp ?
                    (
                        <GameSetup
                            onSetupComplete={this.onSetupComplete}
                            settings={this.state.currentSettings}
                        />
                    ) :
                    (
                        <KadiBoard
                            settings={this.state.currentSettings}
                            returnToSetup={this.returnToSetup}
                        />
                    )
                }
            </>
        );
    }
}

export default Game;