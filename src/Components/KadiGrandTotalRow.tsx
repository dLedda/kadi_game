import React, {ReactNode} from "react";
import LocaleContext from "../LocaleContext";
import KadiCell from "./KadiCell";
import {FieldType} from "../static/enums";
import {Icon} from "semantic-ui-react";
import {CellScores} from "./KadiBoard";

interface KadiGrandTotalRowProps {
    showResults: boolean;
    scores: CellScores;
    toggleShowResults(): void;
}

const KadiGrandTotalRow: React.FunctionComponent<KadiGrandTotalRowProps> = ({ showResults, toggleShowResults, scores}) => {
    const cells: ReactNode[] = [];
    const Locale = React.useContext(LocaleContext).strings;

    for (const playerId in scores) {
        cells.push((
            <KadiCell
                key={"cell_grandtotal_" + playerId}
                location={{blockId: "global", cellId: "grandTotal"}}
                fieldType={FieldType.globalTotal}
                playerId={playerId}
                value={scores[playerId]}
                onCellEdit={() => {}}
            />
        ));
    }
    return (
        <tr
            key={"rowContGrandTotal"}
            className={"kadiRow " + FieldType.globalTotal + (showResults ? "" : " hideResults")}
        >
            <td
                onClick={toggleShowResults}
                className="kadiCell rowLabelCell"
            >
                {Locale.rowLabels.globalTotal}
                <Icon className={"showResultsIcon"} name={showResults ? "hide" : "unhide"} />
            </td>
            {cells}
        </tr>
    );
};

export default KadiGrandTotalRow;