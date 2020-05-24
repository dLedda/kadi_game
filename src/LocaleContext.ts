import {SupportedLang} from "./static/enums";
import React from "react";
import {IntlStrings} from "./static/strings";

export interface ILocaleContext {
    currentLang: SupportedLang;
    strings: any;
    changeLang: (lang: SupportedLang) => void;
}

export const localeDefaultVal: ILocaleContext = {
    currentLang: SupportedLang.gb,
    strings: IntlStrings[SupportedLang.gb as SupportedLang],
    changeLang: () => {},
};

const LocaleContext = React.createContext(localeDefaultVal);

export default LocaleContext;