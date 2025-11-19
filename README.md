# Vibe Sheet

Vibe Sheet is a customizable and interactive spreadsheet library built with React and TypeScript. It provides core spreadsheet functionalities, including cell editing, formula evaluation, styling, and data import/export capabilities (CSV, Markdown, ODS).

## Build System

To build the project, simply run the `Build.sh` script:

```bash
./Build.sh
```

This script will:
1. Install all necessary dependencies.
2. Compile the TypeScript code and bundle the application using Webpack.
3. Generate the JavaScript bundle (`bundle.js`), an `index.html` template, and TypeScript declaration files (`vibe-sheet.d.ts`) in the `dist/` directory.

To generate only the TypeScript declaration file, run:

```bash
npm run build:types
```

## Usage Example

After building the project, the compiled JavaScript bundle (`bundle.js`) and an `index.html` template will be located in the `dist/` directory.

To use the Vibe Sheet in your own web application, ensure your `index.html` file includes a root element (e.g., `<div id="root"></div>`) and links to the generated `bundle.js`.

**Example `index.html`:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Vibe Sheet Application</title>
    <!-- Include your global CSS files here, if any -->
</head>
<body>
    <div id="root"></div>
    <script src="dist/bundle.js"></script>
    <!-- The bundle.js contains the entire React application which will render into the #root element. -->
    <!-- For TypeScript projects, you can use the generated declaration file `dist/vibe-sheet.d.ts` 
         to get type intellisense when importing components from the Vibe Sheet library. 
         You would typically configure your TypeScript project to include this declaration file. -->
</body>
</html>
```
