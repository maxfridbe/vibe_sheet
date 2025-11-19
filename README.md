# Vibe Sheet

Vibe Sheet is a customizable and interactive spreadsheet library built with React and TypeScript. It provides core spreadsheet functionalities, including cell editing, formula evaluation, styling, and data import/export capabilities (CSV, Markdown, ODS).

## Build System

To build the project, run the following command:

```bash
npm run build
```

This script will:
1. Clean the `dist/` directory.
2. Bundle the source code into a UMD library (`dist/vibe-sheet.js`).
3. Generate a single TypeScript declaration file (`dist/vibe-sheet.d.ts`).
4. Copy a standalone example `index.html` to the `dist/` directory.

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
</head>
<body>
    <div id="root" style="height: 100vh;"></div>

    <!-- 1. Load React and ReactDOM -->
    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>

    <!-- 2. Load the Vibe Sheet library -->
    <script src="vibe-sheet.js"></script>

    <!-- 3. Render the Spreadsheet component -->
    <script>
        const App = () => {
            return React.createElement('div', { style: { height: '100%' } },
                React.createElement(VibeSheet.Spreadsheet)
            );
        };
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(React.createElement(App));
    </script>
</body>
</html>
```

For TypeScript projects, you can use the generated declaration file `dist/vibe-sheet.d.ts` to get type intellisense when importing components from the Vibe Sheet library. You would typically configure your TypeScript project to include this declaration file.

