import Settings from "./settings.json";
import React from "react";
import {SupportedLang} from "./enums";

// Formats strings
// formatUnicorn("Hello, {0}!", ["World"]) becomes "Hello, World!"
// {0} is the first entry in args, {1} the second, etc.
export function formatUnicorn(fmt: string, ...args: string[]): string {
    if (!fmt.match(/^(?:(?:(?:[^{}]|(?:\{\{)|(?:\}\}))+)|(?:\{[0-9]+\}))+$/)) {
        throw new Error('Invalid formatUnicorn input string.');
    }
    return fmt.replace(/((?:[^{}]|(?:\{\{)|(?:\}\}))+)|(?:\{([0-9]+)\})/g, (m: string, str: string, index: number) => {
        if (str) {
            return str.replace(/(?:{{)|(?:}})/g, m => m[0]);
        } else {
            if (index >= args.length) {
                throw new Error('Argument index is out of range in formatUnicorn call.');
            }
            return args[index];
        }
    });
}

export const LanguageNames: Record<SupportedLang, string> = {
    en: "English",
    de: "Deutsch",
    it: "Italiano",
};

const IntlStrings = {
    en: {
        rowLabels: {
            subtotal: "Subtotal",
            bonus: "Bonus",
            blockTotal: "Total for {0}",
            globalTotal: "Total"
        },
        headers: {
            rowLabels: "",
        },
        buttons: {
            showHideResultsButton: {
                show: "Show results",
                hide: "Hide results",
            },
            undoButton: "Undo",
            redoButton: "Redo",
            returnToSetupButton: "Back to setup",
            saveGameButton: "Save game",
            savingGame: "Saving...",
        },
        languageNames: {
            en: "English",
            de: "German",
            it: "Italian"
        },
        setupScreen: {
            selectLanguage: "Change language:",
            selectRuleset: "Choose a ruleset to play with:",
            startGame: "Start playing!",
            noPlayersEntered: "No players! Click here to add one...",
            clickToAddPlayer: "Click here to add a player...",
            players: "Players:",
        },
    },
    de: {
        rowLabels: {
            subtotal: "Zwischensumme",
            bonus: "Bonus",
            blockTotal: "Summe {0}",
            globalTotal: "Gesamt"
        },
        headers: {
            rowLabels: "",
        },
        buttons: {
            showHideResultsButton: {
                show: "Ergebnisse einblenden",
                hide: "Ergebnisse ausblenden",
            },
            undoButton: "Rückgängig",
            redoButton: "Wiederholen",
            returnToSetupButton: "Zurück zu Einstellungen",
            saveGameButton: "Spiel speichern",
            savingGame: "Wird gespeichert...",
        },
        setupScreen: {
            selectLanguage: "Sprache ändern:",
            selectRuleset: "Wähle ein Regelwerk aus:",
            startGame: "Spiel starten!",
            noPlayersEntered: "Leer! Hier tippen und hinzufügen...",
            clickToAddPlayer: "Zum Hinzufügen hier tippen...",
            players: "Mitspieler:",
        },
    },
    it: {
        rowLabels: {
            subtotal: "Subtotale",
            bonus: "Bonus",
            blockTotal: "Totale {0}",
            globalTotal: "Totale generale"
        },
        headers: {
            rowLabels: "",
        },
        buttons: {
            showHideResultsButton: {
                show: "Mostra totali",
                hide: "Nasconda totali",
            },
            undoButton: "Annullo",
            redoButton: "Ripristino",
            returnToSetupButton: "Torna a impostazioni",
            saveGameButton: "Salva gioco",
            savingGame: "Salva...",
        },
        setupScreen: {
            selectLanguage: "Cambia lingua:",
            selectRuleset: "Sceglia il regolamento:",
            startGame: "Gioca!",
            noPlayersEntered: "Nessuno! Inserire un nome qui...",
            clickToAddPlayer: "Clicca per inserire un altro nome...",
            players: "Giocatori:",
        },
    },
} as const;

export const localeDefaultVal = {
    strings: IntlStrings[Settings.lang as SupportedLang],
    changeLang: changeLang,
};

export const LocaleContext = React.createContext(localeDefaultVal);

export function changeLang(newLang: SupportedLang): void {
    localeDefaultVal.strings = IntlStrings[newLang];
}