import React, {ReactNode} from "react";
import KadiCell from "./KadiCell";
import {FieldType} from "../static/enums";
import {CellScores} from "./KadiBoard";

interface KadiBlockTotalRowProps {
    blockId: string;
    scores: CellScores;
}

const KadiBlockTotalRow: React.FunctionComponent<KadiBlockTotalRowProps> = ({ blockId, scores }) => {
    const cells: ReactNode[] = [];
    for (const playerId in scores) {
        cells.push((
            <KadiCell
                key={"cell_total_" + blockId + "_" + playerId}
                location={{ blockId, cellId: "total"}}
                fieldType={FieldType.total}
                playerId={playerId}
                value={scores[playerId]}
                onCellEdit={() => {}}
            />
        ));
    }
    return <>{cells}</>;
};

export default KadiBlockTotalRow;