import React from "react";

interface GenericKadiRowContainerProps {
    cellCssClassName: string;
    label: string;
}

const GenericKadiRowContainer: React.FunctionComponent<GenericKadiRowContainerProps> = ({ cellCssClassName, label, children }) => {
    return (
        <tr className={"kadiRow " + cellCssClassName}>
            <td className="kadiCell rowLabelCell">{label}</td>
            {children}
        </tr>
    );
};

export default GenericKadiRowContainer;