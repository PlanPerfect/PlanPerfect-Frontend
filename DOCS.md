# PlanPerfect Frontend Documentation

### Extensions

A collection of helpers which can be used anywhere in the codebase, simply by importing the necessary tools.

1. **ShowToast**

**Example Usage:**

```js
import ShowToast from '../Extensions/ShowToast'

<Button
    colorPalette={"green"}
    onClick={() =>
        ShowToast("success", "Over here!", "This is a toast!")
    }
>
    Click me!
</Button>
```

### Routing

All routing logic is handled in `main.jsx` using React Router DOM. Each page component is imported and assigned a route path.

`Layout.jsx` is a high-level wrapper which encapsulates the entire app, providing consistent UI elements and components across all pages.

### Styling

Base styles are applied in `index.css` and `app.css`. To style your components, apply inline-styling using Chakra UI's props system directly in the component files.

### UI Components

Chakra UI provides a wide range of pre-built components that can be imported and used out of the box. Some components may require installation using the Chakra CLI, which has been setup in this project. Installed components will appear in `src/components/ui/`. To create new components, create a new folder in `src/components/` and add your component files there. The `ui/` folder should be reserved for Chakra UI components only.

### Assets

All static assets such as images, icons, and fonts are stored in the `src/assets/` directory. You can import these assets into your components and pages as needed.

### MCP Server Guide (Optional)

To provide the various LLM-enabled Agents (E.g Copilot Chat, Cursor, Claude Code) with contextual knowledge on Chakra UI's V3 Component Library, we have set up a local MCP server.

To do so, create a new file at `.vscode/mcp.json` and add the following contents:

```json
{
  "servers": {
    "chakra-ui": {
      "command": "npx",
      "args": ["-y", "@chakra-ui/react-mcp"]
    }
  }
}
```

You should see a start button appear in the JSON block. Start the server and now head to your respective Agent settings where you'll be able to Configure Tools. You should see a list of Chakra UI Tools. Enable all of them and your agent will now have access to Chakra UI's documentation when generating code snippets.

To stop the MCP Server, simply click the stop button in the JSON block back in `.vscode/mcp.json`.