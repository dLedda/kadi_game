import React, {ReactNode} from "react";
import KadiCell from "./KadiCell";
import {FieldType} from "../static/enums";
import {CellScores} from "./KadiBoard";

interface KadiBlockSubtotalRowProps {
    blockId: string;
    scores: CellScores;
}

const KadiBlockSubtotalRow: React.FunctionComponent<KadiBlockSubtotalRowProps> = ({ blockId, scores}) => {
    const cells: ReactNode[] = [];
    for (const playerId in scores) {
        cells.push((
            <KadiCell
                key={"cell_subtotal_" + blockId + "_" + playerId}
                location={{ blockId, cellId: "subtotal"}}
                fieldType={FieldType.subtotal}
                playerId={playerId}
                value={scores[playerId]}
                onCellEdit={() => {}}
            />
        ));
    }
    return <>{cells}</>;
};

export default KadiBlockSubtotalRow;