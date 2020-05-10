import React from "react";

interface useLongPressReturnProps {
    onMouseDown: () => void,
    onTouchStart: () => void,
    onMouseUp: () => void,
    onMouseLeave: () => void,
    onTouchEnd: () => void,
}

export const useLongPress: (onLongPress: () => void, timeoutMs: number) => useLongPressReturnProps = (
    onLongPress: () => void,
    timeoutMs: number
) => {
    const [doingLongPress, updateDoingLongPress] = React.useState(false);

    React.useEffect(() => {
        let timerId: number = 0;
        if (doingLongPress) {
            timerId = window.setTimeout(onLongPress, timeoutMs);
        }
        else {
            window.clearTimeout(timerId);
        }
        return () => {
            window.clearTimeout(timerId);
        };
    }, [doingLongPress]);

    const startLongPress = React.useCallback(() => {
        updateDoingLongPress(true);
    }, []);

    const stopLongPress = React.useCallback(() => {
        updateDoingLongPress(false);
    }, []);

    return {
        onMouseDown: startLongPress,
        onTouchStart: startLongPress,
        onMouseUp: stopLongPress,
        onMouseLeave: stopLongPress,
        onTouchEnd: stopLongPress,
    };
};
