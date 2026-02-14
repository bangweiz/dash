## Converting Official Documentation (Docsets)

You can convert official Docsets (used by Dash/Zeal) into the JSON format supported by this application using the included script.

### Prerequisites

1.  Download a Docset (e.g., from [Zeal's feed](https://zealusercontent.com/org.zealdocs.zeal/manifest.json) or [Kapeli's repo](https://github.com/Kapeli/Dash-User-Contributions)).
2.  Extract the Docset so you have a `.docset` directory.

### Usage

Run the conversion script:

```bash
bun run convert-docset <path-to-docset-folder> [output-file.json]
```

Example:

```bash
bun run convert-docset ./downloads/Go.docset ./go-plugin.json
```

Then, in the application:
1.  Click the "+" button in the sidebar.
2.  Copy the content of the generated JSON file.
3.  Paste it into the import modal.