import React, {ChangeEvent, FocusEvent, ReactNode, KeyboardEvent} from "react";
import {CellFlag, FieldType} from "../static/enums";
import {ScoreCellValue} from "../Classes/ScoreCell";
import {CellEventResponse} from "./KadiBoard";
import {CellLocation} from "../Classes/PlayerScoreCard";
import {useLongPress} from "./useLongPress";

export type KadiCellDisplayValue = ScoreCellValue | CellFlag.strike;

export interface KadiCellProps {
    location: CellLocation;
    fieldType: FieldType;
    playerId: string;
    value: KadiCellDisplayValue;
    showResults?: boolean;
    onCellEdit: (response: CellEventResponse) => void;
}

interface KadiCellState {}

class KadiCell extends React.Component<KadiCellProps, KadiCellState> {
    private readonly standardTimeoutTimeMs: number;
    constructor(props: KadiCellProps) {
        super(props);
        this.standardTimeoutTimeMs = 400;
    }

    shouldComponentUpdate(
        nextProps: Readonly<KadiCellProps>,
        nextState: Readonly<KadiCellState>,
        nextContext: any): boolean {
        return nextProps.value != this.props.value;
    }

    updateCell = (value: ScoreCellValue): void => {
        const response: CellEventResponse = {
            value: value,
            playerId: this.props.playerId,
            location: this.props.location,
        };
        this.props.onCellEdit(response);
    };

    strikeCell = (): void => {
        const response: CellEventResponse = {
            value: CellFlag.strike,
            playerId: this.props.playerId,
            location: this.props.location,
        };
        this.props.onCellEdit(response);
    };

    unstrikeCell = (): void => {
        const response: CellEventResponse = {
            value: CellFlag.unstrike,
            playerId: this.props.playerId,
            location: this.props.location,
        };
        this.props.onCellEdit(response);
    };

    render(): ReactNode {
        const {
            fieldType,
            value,
        } = this.props;

        const propsForEditableCell = {
            timeoutMs: this.standardTimeoutTimeMs,
            updateCell: this.updateCell,
            strikeCell: this.strikeCell,
            value: value as ScoreCellValue,
        };

        if (value === CellFlag.strike) {
            return <StrikeKadiCell unstrikeCell={this.unstrikeCell} />;
        }
        else {
            switch (fieldType) {
                case FieldType.bonus:
                case FieldType.subtotal:
                case FieldType.total:
                case FieldType.globalTotal:
                    return (
                        <GenericResultsKadiCell
                            classNameString={fieldType}
                            value={value}
                        />
                    );
                case FieldType.bool:
                    return <BoolKadiCell {...propsForEditableCell}/>;
                case FieldType.multiplier:
                    return <MultipleKadiCell {...propsForEditableCell}/>;
                case FieldType.number:
                    return <NumberKadiCell {...propsForEditableCell}/>;
                case FieldType.yahtzee:
                    return <YahtzeeKadiCell {...propsForEditableCell}/>;
            }
        }
    }
}

interface StandardKadiCellProps {
    value: ScoreCellValue,
}

interface StrikeKadiCellProps {
    unstrikeCell: () => void,
}

interface ResultsKadiCellProps extends StandardKadiCellProps {
}

interface UpdateableKadiCellProps extends StandardKadiCellProps {
    updateCell: (updateVal: ScoreCellValue) => void,
}

interface LongPressStrikeKadiCellProps extends StandardKadiCellProps {
    timeoutMs: number,
    strikeCell: () => void,
}

interface GenericResultsKadiCellProps extends ResultsKadiCellProps {
    classNameString: string;
}

type EditableKadiCellProps = UpdateableKadiCellProps & LongPressStrikeKadiCellProps;

const NumberKadiCell: React.FunctionComponent<EditableKadiCellProps> = ({ strikeCell, updateCell, value , timeoutMs}) => {
    const [beingEdited, setBeingEdited] = React.useState(false);
    const [currentEditValue, setCurrentEditValue] = React.useState("");
    const strikeCellOnLongPress = useLongPress(strikeCell, timeoutMs);

    const displayText: string = beingEdited ? currentEditValue : value.toString();

    const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
        setBeingEdited(true);
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setCurrentEditValue(e.target.value);
        if (e.target.value == "") {
            strikeCell();
            endInput();
        }
    };

    const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
        submitInput(e.target.value);
    };

    const handleKeyUp = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            submitInput(e.currentTarget.value);
        }
    };

    const submitInput = (input: string) => {
        updateCell(Number(input));
        endInput();
    };

    const endInput = () => {
        setBeingEdited(false);
        setCurrentEditValue("");
    };

    return (
        <td className={"kadiCell editable numberField"}>
            <div className={"numberField"}>
                <input
                    type={"number"}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onInput={handleChange}
                    onChange={handleChange}
                    onKeyUp={handleKeyUp}
                    value={displayText}
                    className={"numberField"}
                    onAuxClick={strikeCell}
                    {...strikeCellOnLongPress}
                />
            </div>
        </td>
    )
};

const YahtzeeKadiCell: React.FunctionComponent<EditableKadiCellProps> = ({value, timeoutMs, strikeCell, updateCell}) => {
    const handleClick = (): void => updateCell(true);
    const strikeCellOnLongPress = useLongPress(strikeCell, timeoutMs);
    return (
        <td
            className={"kadiCell editable yahtzeeField"}
            onClick={handleClick}
            {...strikeCellOnLongPress}
        >
            <div className={"yahtzeeField"}>
                {value}
            </div>
        </td>
    )
};

const BoolKadiCell: React.FunctionComponent<EditableKadiCellProps> = ({value, timeoutMs, strikeCell, updateCell}) => {
    const handleClick = (): void => updateCell(true);
    const strikeCellOnLongPress = useLongPress(strikeCell, timeoutMs);
    return (
        <td
            className={"kadiCell editable boolField " + (value ? "checked" : "unchecked")}
        >
            <div
                className="clickableArea"
                onClick={handleClick}
                {...strikeCellOnLongPress}
            />
        </td>
    )
};

const MultipleKadiCell: React.FunctionComponent<EditableKadiCellProps> = ({value, timeoutMs, strikeCell, updateCell}) => {
    const handleClick = (): void => updateCell(true);
    const strikeCellOnLongPress = useLongPress(strikeCell, timeoutMs);
    return (
        <td
            className={"kadiCell editable multipleField"}
            onClick={handleClick}
            {...strikeCellOnLongPress}
        >
            <div className={"multipleField"}>
                {value}
            </div>
        </td>
    )
};

const GenericResultsKadiCell: React.FunctionComponent<GenericResultsKadiCellProps> = ({value, classNameString}) => {
    return (
        <td className={"kadiCell " + classNameString}>
            <div className={classNameString}>
                {value}
            </div>
        </td>
    )
};

const StrikeKadiCell: React.FunctionComponent<StrikeKadiCellProps> = ({unstrikeCell}) => {
    const updateCell = () => unstrikeCell();
    return (
        <td
            className={"kadiCell strikeCell"}
            onClick={updateCell}
        />
    );
};

export default KadiCell;