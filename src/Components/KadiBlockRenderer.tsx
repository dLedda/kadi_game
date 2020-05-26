import {BlockDef} from "../static/rulesets";
import {CellLocation} from "../Classes/PlayerScoreCard";
import React, {ReactElement} from "react";
import {formatUnicorn} from "../static/strings";
import {FieldType} from "../static/enums";
import {BlockScores, CellEventResponse} from "./KadiBoard";
import GenericKadiRowContainer from "./GenericKadiRowContainer";
import KadiEditableRowCells from "./KadiEditableRowCells";
import KadiBlockTotalRow from "./KadiBlockTotalRow";
import KadiBlockSubtotalRow from "./KadiBlockSubtotalRow";
import KadiBlockBonusRow from "./KadiBlockBonusRow";
import LocaleContext from "../LocaleContext";

interface BlockRendererProps {
    blockId: string;
    blockSchema: BlockDef;
    showResults: boolean;
    onCellEdit(res: CellEventResponse): void;
    scores: BlockScores;
}

const KadiBlockRenderer: React.FunctionComponent<BlockRendererProps> = (props) => {
    const { blockSchema, showResults, scores, onCellEdit, blockId} = props;
    const rowsInBlock: ReactElement[] = [];
    const Locale = React.useContext(LocaleContext).strings;

    for (const cell in blockSchema.cells) {
        const cellSchema = blockSchema.cells[cell];
        rowsInBlock.push((
            <GenericKadiRowContainer
                key={"rowCont" + cell + blockId}
                label={cellSchema.label}
                cellCssClassName={cellSchema.fieldType}
            >
                <KadiEditableRowCells
                    location={{blockId, cellId: cell}}
                    fieldType={cellSchema.fieldType}
                    scores={scores[cell]}
                    onCellEdit={onCellEdit}
                />
            </GenericKadiRowContainer>
        ));
    }
    if (blockSchema.hasBonus) {
        rowsInBlock.push(
            <GenericKadiRowContainer
                key={"rowContSubtotal" + blockId}
                label={Locale.rowLabels.subtotal}
                cellCssClassName={FieldType.subtotal + (showResults ? "" : " hideResults")}
            >
                <KadiBlockSubtotalRow
                    blockId={blockId}
                    scores={scores.subtotals}
                />
            </GenericKadiRowContainer>
        );
        rowsInBlock.push(
            <GenericKadiRowContainer
                key={"rowContBonus" + blockId}
                label={Locale.rowLabels.bonus}
                cellCssClassName={FieldType.bonus + (showResults ? "" : " hideResults")}
            >
                <KadiBlockBonusRow
                    blockId={blockId}
                    bonusScore={blockSchema.bonusScore}
                    scores={scores.bonuses}
                />
            </GenericKadiRowContainer>
        );
    }
    rowsInBlock.push(
        <GenericKadiRowContainer
            key={"rowContTotal" + blockId}
            label={formatUnicorn(Locale.rowLabels.blockTotal, blockSchema.label)}
            cellCssClassName={FieldType.total + (showResults ? "" : " hideResults")}
        >
            <KadiBlockTotalRow
                blockId={blockId}
                scores={scores.totals}
            />
        </GenericKadiRowContainer>
    );

    return <>{rowsInBlock}</>;
};

export default KadiBlockRenderer;