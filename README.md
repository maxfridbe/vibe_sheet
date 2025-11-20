# Vibe Sheet

Vibe Sheet is a customizable and interactive spreadsheet library built with React and TypeScript. It provides core spreadsheet functionalities, including cell editing, formula evaluation, styling, and data import/export capabilities.

## Features

### Import/Export
*   **Export:** Data can be exported to CSV, Markdown, and ODS (`.fods`) formats.
*   **Import:** Data can be imported from CSV files programmatically.

### User Interface (UI)
*   **Grid:** An interactive spreadsheet grid supporting:
    *   Cell selection and keyboard navigation.
    *   In-cell editing.
    *   Copy/paste operations.
    *   Context menu for inserting and deleting rows/columns.
*   **Toolbar:** A rich toolbar for cell styling and formatting, including:
    *   Undo/Redo.
    *   Text styling: bold, italic, underline.
    *   Text alignment.
    *   Number formats: currency, percent.
    *   Cell borders and color fills.
*   **Formula Bar:** Displays the address of the active cell and an input for editing its raw value or formula.
*   **Data Toolbar:** Provides UI controls for triggering data exports.

### Core Functionality
*   **Formula Engine:**
    *   Supports built-in functions: `SUM`, `AVERAGE`, `MAX`, `MIN`, `SIN`, `COS`, `TAN`, `ABS`, `SQRT`, and `PI()`.
*   **Cell References:**
    *   **Relative References** (e.g., `A1`): Standard support for references that change when a formula is copied or moved.
    *   **Absolute References** (e.g., `$A$1`): Partial support. Absolute references are correctly maintained (i.e., they do not shift) when inserting or deleting rows and columns. However, during formula calculation, they currently behave as relative references.

## Build System

The project is built using a combination of Webpack, Babel, and the TypeScript Compiler (`tsc`). The main build command is `npm run build`.

Here is a detailed breakdown of the process:

1.  **Cleanup**: The `dist/` directory is deleted to ensure a clean build.
2.  **TypeScript Transpilation & Bundling**: Webpack is invoked to bundle the application.
    *   The entry point is `vibesheet/index.ts`.
    *   TypeScript (`.ts`, `.tsx`) files are transpiled into ES5-compatible JavaScript by Babel.
    *   All transpiled JavaScript is bundled into a single UMD (Universal Module Definition) library file, making it compatible with various module systems.
    *   All CSS is processed with PostCSS (for Tailwind) and extracted into a single companion CSS file.
    *   `react` and `react-dom` are treated as external peer dependencies and are not included in the final bundle.
3.  **Type Declaration Generation**:
    *   The TypeScript Compiler (`tsc`) runs with `emitDeclarationOnly` to generate individual type definition (`.d.ts`) files for the source code.
    *   These individual `.d.ts` files are then concatenated into a single, combined type definition file.
    *   The original, individual definition files are deleted.
4.  **Copy Example**: A standalone example file, `example/index.html`, is copied into the `dist/` directory for demonstration.

### The `dist` Directory

After a successful build, the `dist/` directory will contain the following files:

*   `vibe-sheet.js`: The complete, bundled UMD JavaScript library.
*   `vibe-sheet.css`: All required styles for the component.
*   `vibe-sheet.d.ts`: A single file containing all TypeScript type definitions for the library.
*   `index.html`: A standalone example HTML page for viewing and testing the component.

## Usage Example

After building the project, the `dist/` directory will contain the distributable library files and an example `index.html`. You can open `dist/index.html` in your browser to see a live example of the spreadsheet component.

To use the Vibe Sheet library in your own project, you can include it as a script tag. Since `react` and `react-dom` are peer dependencies, you will need to include them in your project as well.

**Example `index.html`:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vibe Sheet Example</title>
    <link rel="stylesheet" href="vibe-sheet.css">
    <style>
        body {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f0f0f0;
            font-family: sans-serif;
        }
        #root {
            width: 80vw;
            height: 80vh;
            resize: both;
            overflow: auto;
            border: 1px solid #ccc;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            background-color: white;
        }
    </style>
</head>
<body>
    <div id="root"></div>

    <!-- 1. Load React and ReactDOM -->
    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>

    <!-- 2. Load the Vibe Sheet library -->
    <script src="vibe-sheet.js"></script>

    <!-- 3. Render the Spreadsheet component -->
    <script>
        const generateMortgageData = () => {
            const data = {};
            const getCellId = (c, r) => {
                let l = '';
                let i = c;
                while (i >= 0) {
                    l = String.fromCharCode(65 + (i % 26)) + l;
                    i = Math.floor(i / 26) - 1;
                }
                return `${l}${r + 1}`;
            };

            const allBorders = { borderTop: true, borderBottom: true, borderLeft: true, borderRight: true };

            // Inputs
            data[getCellId(0, 0)] = { value: "Loan Amount", style: { bold: true } };
            data[getCellId(1, 0)] = { value: "400000", style: { format: 'currency' } };
            data[getCellId(0, 1)] = { value: "Annual Interest Rate", style: { bold: true } };
            data[getCellId(1, 1)] = { value: "0.04", style: { format: 'percent' } };
            data[getCellId(0, 2)] = { value: "Loan Term (years)", style: { bold: true } };
            data[getCellId(1, 2)] = { value: "30" };
            data[getCellId(0, 3)] = { value: "Monthly Payment", style: { bold: true } };
            data[getCellId(1, 3)] = { value: "=B1*(B2/12*(1+B2/12)^(B3*12))/((1+B2/12)^(B3*12)-1)", style: { format: 'currency' } };

            // Headers
            const headers = ["Month", "Beginning Balance", "Monthly Payment", "Principal Paid", "Interest Paid", "Ending Balance"];
            headers.forEach((h, c) => {
                const id = getCellId(c, 5);
                data[id] = { value: h, style: { bold: true, align: 'center', backgroundColor: '#f3f4f6', ...allBorders } };
            });

            // Table
            for (let i = 0; i < 360; i++) {
                const row = i + 6;
                const backgroundColor = i % 2 === 0 ? '#e0f2fe' : undefined;
                // Month
                data[getCellId(0, row)] = { value: (i + 1).toString(), style: { align: 'center', ...allBorders, backgroundColor } };
                // Beginning Balance
                if (i === 0) {
                    data[getCellId(1, row)] = { value: "=B1", style: { format: 'currency', ...allBorders, backgroundColor } };
                } else {
                    data[getCellId(1, row)] = { value: `=F${row}`, style: { format: 'currency', ...allBorders, backgroundColor } };
                }
                // Monthly Payment
                data[getCellId(2, row)] = { value: "=$B$4", style: { format: 'currency', ...allBorders, backgroundColor } };
                // Interest Paid
                data[getCellId(4, row)] = { value: `=B${row+1}*($B$2/12)`, style: { format: 'currency', ...allBorders, backgroundColor } };
                // Principal Paid
                data[getCellId(3, row)] = { value: `=C${row+1}-E${row+1}`, style: { format: 'currency', ...allBorders, backgroundColor } };
                // Ending Balance
                data[getCellId(5, row)] = { value: `=B${row+1}-D${row+1}`, style: { format: 'currency', ...allBorders, backgroundColor } };
            }

            return data;
        };

        const App = () => {
            return React.createElement('div', { style: { height: '100%', display: 'flex', flexDirection: 'column' } },
                React.createElement(VibeSheet.Spreadsheet, { initialData: generateMortgageData() })
            );
        };
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(React.createElement(App));
    </script>
</body>
</html>
```

For TypeScript projects, you can use the generated declaration file `dist/vibe-sheet.d.ts` to get type intellisense when importing components from the Vibe Sheet library. You would typically configure your TypeScript project to include this declaration file.

