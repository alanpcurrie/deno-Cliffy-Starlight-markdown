# Deno Cliffy Starlight markdown

![Logo](logo-min.png)


# Markdown Organiser for Starlight Documentation

This project is a Deno-based tool that organizes README.md files into an Starlight documentation structure. It automates the process of integrating markdown files into an Starlight-powered documentation site.

## Project Overview

The Markdown Organizer performs the following main functions:

1. Searches for README.md files in a specified directory and its subdirectories.
2. Extracts titles from the markdown files.
3. Copies the README.md files to a designated output directory, renaming them based on their titles.
4. Updates an `astro.config.mjs` configuration file with new sidebar items for each processed markdown file.

This tool is useful for projects that want to automatically generate documentation from scattered README files across a repository.

## Key Features

- **Markdown Processing**: Extracts titles and content from README.md files.
- **File Organisation**: Copies and renames markdown files to a structured documentation directory.
- **Starlight Config Management**: Automatically updates the Starlight configuration with new sidebar items.
- **Flexible Input/Output**: Allows specifying custom input and output directories.

## Tasks

The project includes the following task:

- `dev`: Run the main script in watch mode
  ```
  deno run --watch main.ts
  ```

## Main Functions

1. `getMarkdownTitle`: Extracts the title from a markdown file.
2. `parseSidebarItems`: Parses existing sidebar items from the Starlight config.
3. `updateStarlightConfig`: Updates the Starlight config file with new sidebar items.
4. `processReadmeFile`: Processes a single README.md file, copying it to the guides directory and updating the Starlight config.
5. `organiseReadmeFiles`: Main function that walks through the input directory and processes README files.

## Deno Compile

You can compile this project into a single executable using Deno's compile feature. This is  useful for distributing the tool to users who don't have Deno installed.

### Basic Usage

To compile your project, use the following command:

```bash
deno compile --allow-read --allow-write main.ts
```

This will create an executable file named `main` (or `main.exe` on Windows) in your current directory.

### Compile Options

- `--output <path>`: Set the output file (defaults to the source file stem)
- `--target <target>`: Set target OS (windows, mac, linux) and architecture (x86_64, aarch64)
- `--no-check`: Skip type checking modules

### Cross Compilation

Deno supports cross-compilation. You can specify the target OS and architecture:

```bash
deno compile --target x86_64-unknown-linux-gnu --allow-read --allow-write main.ts
```

### Permissions

When compiling, you need to specify all the permissions that your application requires:

```bash
deno compile --allow-read --allow-write main.ts
```

The `--allow-read` and `--allow-write` permissions are necessary for this project to read input files and write output files.

## Running the Project

To run the project in development mode:

```bash
deno task dev
```

This will start the main script in watch mode, restarting it whenever changes are detected.

To run the compiled version:

```bash
./main
```

Follow the prompts to specify the input directory and Starlight config file path.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.