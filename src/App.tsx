import React, {ReactNode} from "react";
import Game from "./Components/Game";
import {LocaleContext, localeDefaultVal} from "./static/strings";
import "semantic-ui-css/semantic.min.css";

interface AppState {
}

interface AppProps {}

class App extends React.Component<AppProps, AppState> {
    constructor(props: AppProps) {
        super(props);

        this.state = {
        };
    }

    render(): ReactNode {
        return (
            <LocaleContext.Provider value={localeDefaultVal}>
                <Game/>
            </LocaleContext.Provider>
        );
    }
}
App.contextType = LocaleContext;

export default App;