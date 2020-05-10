import {CellLocation} from "../Classes/PlayerScoreCard";
import {FieldType} from "../static/enums";
import React, {ReactElement} from "react";
import KadiCell from "./KadiCell";
import {CellEventResponse, CellScores} from "./KadiBoard";

interface KadiEditableRowCellsProps {
    location: CellLocation;
    fieldType: FieldType;
    scores: CellScores;
    onCellEdit(res: CellEventResponse): void;
}

const KadiEditableRowCells: React.FunctionComponent<KadiEditableRowCellsProps> = ({ location, fieldType, scores, onCellEdit }) => {
    const cells: ReactElement[] = [];

    for (const playerId in scores) {
        cells.push((
            <KadiCell
                key={"cell" + location.cellId + location.blockId + playerId}
                location={location}
                fieldType={fieldType}
                playerId={playerId}
                value={scores[playerId]}
                onCellEdit={onCellEdit}
            />
        ));
    }

    return <>{cells}</>;
};

export default KadiEditableRowCells;