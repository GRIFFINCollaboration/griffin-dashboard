#xWaffle

`<x-waffle>` is a generic grid-based color-coded summarization tool for visualizing the state of large numbers of channels of information at once.

###Members

Waffle parameters are controled by the following member variables.

 - `rows` `int`: number of rows of grid cells
 - `cols` `int`: number of columns of gird cells
 - `specials` `{key: [top left row, top left col, width, height], ...}`: grid cells default to 1 row by 1 column, but larger blocks can be defined in this object.  `key` will be used to reference the cell on update.
 - `dividers` `{key: [start col, start row, end col, end row], ...}`: defines placement of heavy lines for dividing grid into sub-sections.
 - `cellNames` `[row][col] = string`: array of keys to use for referring to the 1x1 cell at position `[row][col]`.
 - `TTdata` `{key: {label0: value, label1: value, ...}, ...}`: object containing information to list in the tooltip for cell referenced by `key`; each subkey in the corresponding object will be used as a row title in the tooltip, with the corresponding value displayed alongside it.
 - `clickCell` `function(cellName)`: a function to be called when the cell labeled `cellName` is clicked; the key refrenceing that cell is passed in as `cellName`.
 - `colTitles` `[[string, start column, max width in columns], ...]`: text and positions for column titles.
 - `rowTitles` `[row0 title, row1 title, ...]`: array of strings titling each row.
 - `legend` `[[string color, string label], ...]`: array legend entries.  Each entry consists of a color and a descriptive text.

###Usage

Once the relevant member variables are set, the member function `instantiateCells()` will establish all the Kinetic cells, labels and tooltips.

TODO: a member function `update()` will be implemented to update the color and tooltip content of each cell.
