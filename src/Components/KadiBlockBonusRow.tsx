import React, {ReactNode} from "react";
import KadiCell from "./KadiCell";
import {FieldType} from "../static/enums";
import {CellScores} from "./KadiBoard";

interface KadiBlockBonusRowProps {
    blockId: string;
    bonusScore: number;
    scores: CellScores;
}

const KadiBlockBonusRow: React.FunctionComponent<KadiBlockBonusRowProps> = ({ blockId, bonusScore, scores}) => {
    const cells: ReactNode[] = [];
    for (const playerId in scores) {
        cells.push((
            <KadiCell
                key={"cell_bonus_" + blockId + "_" + playerId}
                location={{ blockId, cellId: "bonus"}}
                fieldType={FieldType.bonus}
                playerId={playerId}
                value={scores[playerId] ? bonusScore : 0}
                onCellEdit={() => {}}
            />
        ));
    }
    return <>{cells}</>;
};

export default KadiBlockBonusRow;