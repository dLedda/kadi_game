import React, {ReactNode} from "react";
import Game from "./Components/Game";
import "semantic-ui-css/semantic.min.css";
import {SupportedLang} from "./static/enums";
import {IntlStrings} from "./static/strings";
import UserContext, {IUserContext} from "./UserContext";
import LocaleContext, {ILocaleContext} from "./LocaleContext";
import axios from "axios";
import {SERVER_BASE_NAME} from "./index";

interface AppState {
    userContext: IUserContext;
    localeContext: ILocaleContext;
}

interface AppProps {}

class App extends React.Component<AppProps, AppState> {
    private readonly updateUserContext: (username: string, loggedIn: boolean) => void;
    private readonly changeLang: (lang: SupportedLang) => void;
    constructor(props: AppProps) {
        super(props);

        this.updateUserContext = (username, loggedIn) => {
            this.setState({userContext: {
                    username: username,
                    loggedIn: loggedIn,
                    updateUserContext: this.updateUserContext
                }});
        };

        this.changeLang = (lang: SupportedLang) => {
            if (lang in SupportedLang) {
                this.setState({localeContext: {
                    strings: IntlStrings[lang],
                    currentLang: lang,
                    changeLang: this.changeLang
                }});
            }
        };

        this.state = {
            userContext: {
                username: "",
                loggedIn: false,
                updateUserContext: this.updateUserContext,
            },
            localeContext: {
                currentLang: SupportedLang.gb,
                strings: IntlStrings[SupportedLang.gb],
                changeLang: this.changeLang,
            }
        };
    }

    componentDidMount(): void {
        axios.get("/api/user", {baseURL: SERVER_BASE_NAME})
            .then((res) => {
                const data = res.data as any;
                this.updateUserContext(data.username, true);
                this.changeLang(data.lang);
            })
            .catch(err => console.log(err));
    }

    render(): ReactNode {
        return (
            <LocaleContext.Provider value={this.state.localeContext}>
                <UserContext.Provider value={this.state.userContext}>
                    <Game/>
                </UserContext.Provider>
            </LocaleContext.Provider>
        );
    }
}
App.contextType = LocaleContext;

export default App;