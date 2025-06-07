import React from 'react';
import { Box, Text } from 'ink';
export const ProgressBar = ({ current, total, width = 40 }) => {
    const percentage = total > 0 ? (current / total) * 100 : 0;
    const filledWidth = Math.round((percentage / 100) * width);
    const emptyWidth = width - filledWidth;
    const filled = '█'.repeat(filledWidth);
    const empty = '░'.repeat(emptyWidth);
    return (React.createElement(Box, { flexDirection: "column" },
        React.createElement(Box, null,
            React.createElement(Text, { color: "green" }, filled),
            React.createElement(Text, { color: "gray" }, empty),
            React.createElement(Text, null,
                " ",
                percentage.toFixed(1),
                "%")),
        React.createElement(Text, { color: "gray" },
            current,
            " / ",
            total,
            " completed")));
};
//# sourceMappingURL=ProgressBar.js.map