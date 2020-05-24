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
    blockSchema: BlockDef;
    showResults: boolean;
    onCellEdit(res: CellEventResponse): void;
    scores: BlockScores;
}

const KadiBlockRenderer: React.FunctionComponent<BlockRendererProps> = ({ blockSchema , showResults, scores, onCellEdit}) => {
    const rowsInBlock: ReactElement[] = [];
    const Locale = React.useContext(LocaleContext).strings;

    for (const cell of blockSchema.cells) {
        rowsInBlock.push((
            <GenericKadiRowContainer
                key={"rowCont" + cell.id + blockSchema.id}
                label={cell.label}
                cellCssClassName={cell.fieldType}
            >
                <KadiEditableRowCells
                    location={{blockId: blockSchema.id, cellId: cell.id}}
                    fieldType={cell.fieldType}
                    scores={scores[cell.id]}
                    onCellEdit={onCellEdit}
                />
            </GenericKadiRowContainer>
        ));
    }
    if (blockSchema.hasBonus) {
        rowsInBlock.push(
            <GenericKadiRowContainer
                key={"rowContSubtotal" + blockSchema.id}
                label={Locale.rowLabels.subtotal}
                cellCssClassName={FieldType.subtotal + (showResults ? "" : " hideResults")}
            >
                <KadiBlockSubtotalRow
                    blockId={blockSchema.id}
                    scores={scores.subtotals}
                />
            </GenericKadiRowContainer>
        );
        rowsInBlock.push(
            <GenericKadiRowContainer
                key={"rowContBonus" + blockSchema.id}
                label={Locale.rowLabels.bonus}
                cellCssClassName={FieldType.bonus + (showResults ? "" : " hideResults")}
            >
                <KadiBlockBonusRow
                    blockId={blockSchema.id}
                    bonusScore={blockSchema.bonusScore}
                    scores={scores.bonuses}
                />
            </GenericKadiRowContainer>
        );
    }
    rowsInBlock.push(
        <GenericKadiRowContainer
            key={"rowContTotal" + blockSchema.id}
            label={formatUnicorn(Locale.rowLabels.blockTotal, blockSchema.label)}
            cellCssClassName={FieldType.total + (showResults ? "" : " hideResults")}
        >
            <KadiBlockTotalRow
                blockId={blockSchema.id}
                scores={scores.totals}
            />
        </GenericKadiRowContainer>
    );

    return <>{rowsInBlock}</>;
};

export default KadiBlockRenderer;