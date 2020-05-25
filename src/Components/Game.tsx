import React, {ReactNode} from "react";
import "../static/css/game.css";
import KadiBoard from "./KadiBoard";
import GameSetup, {GameSettings} from "./GameSetup"
import Settings from "../static/settings.json";
import {SERVER_BASE_NAME} from "../index";
import axios from "axios";

export interface Player {
    id: string;
    nick: string;
}

interface GameState {
    currentSettings: GameSettings;
    settingUp: boolean;
    loading: boolean;
    availablePlayers: Player[]
}

interface GameProps {}

class Game extends React.Component<GameProps, GameState> {
    state: GameState;

    constructor(props: GameProps) {
        super(props);

        const startupSettings: GameSettings = {
            players: [],
            ruleset: Settings.ruleset,
        };

        this.state = {
            currentSettings: startupSettings,
            settingUp: true,
            loading: true,
            availablePlayers: [],
        };
    }

    componentDidMount(): void {
        axios.get(SERVER_BASE_NAME + "/api/players")
            .then(response => this.addNewPlayers([...response.data.guests, response.data.mainPlayer]))
            .catch(error => this.handleError(error))
            .finally(() => this.setState({ loading: false }));
        console.log(this.state.availablePlayers);
    }

    addNewPlayers(players: Player[]) {
        const availablePlayers: Player[] = this.state.availablePlayers;
        availablePlayers.push(...players);
        this.setState({availablePlayers});
    }

    handleError(error: any): void {

    };

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
                {!this.state.loading && (this.state.settingUp ?
                    (
                        <GameSetup
                            onSetupComplete={this.onSetupComplete}
                            settings={this.state.currentSettings}
                            availablePlayers={this.state.availablePlayers}
                        />
                    ) :
                    (
                        <KadiBoard
                            settings={this.state.currentSettings}
                            returnToSetup={this.returnToSetup}
                        />
                    )
                )}
            </>
        );
    }
}

export default Game;