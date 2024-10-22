import { P, match } from "jsr:@gabriel/ts-pattern";
import { ensureDir } from "https://deno.land/std@0.181.0/fs/mod.ts";
import { walk } from "https://deno.land/std@0.181.0/fs/walk.ts";
import { join } from "https://deno.land/std@0.181.0/path/mod.ts";
import { Command } from "@cliffy/command";
import { Input } from "@cliffy/prompt";
import { colors  } from "@cliffy/ansi/colors";


type SidebarItem = { label: string; link: string };

const TITLE_REGEX = /^#\s+(.+)$/m;
const SIDEBAR_REGEX = /sidebar:\s*\[([\s\S]*?)\]/;
const ITEM_REGEX = /{\s*label:\s*'([^']+)',\s*link:\s*'([^']+)'\s*}/g;

/**
 * Extracts the title from a markdown file.
 * @param filePath - Path to the markdown file
 * @returns The title of the markdown file or "Untitled" if no title is found
 */
async function getMarkdownTitle(filePath: string): Promise<string> {
  const content = await Deno.readTextFile(filePath);
  return match(content.match(TITLE_REGEX))
    .with(P.not(P.nullish), (match) => match[1].trim())
    .otherwise(() => "Untitled");
}

/**
 * A generator function that yields all regex matches in a string.
 * It uses recursion for a functional approach and supports transformation of matches.
 * 
 * @template T - The type of the transformed match. Must extend RegExpExecArray.
 * @param {string} content - The string to search for matches.
 * @param {RegExp} regex - The regex pattern to match against.
 * @param {function} transform - Optional function to transform the RegExpExecArray to type T.
 *                               Defaults to casting the match to T.
 * @param {number} startIndex - Optional starting index for the search. Defaults to 0.
 * @yields {T} Transformed regex matches.
 */
function* regexMatchGenerator<T extends RegExpExecArray>(
  content: string,
  regex: RegExp,
  transform: (match: RegExpExecArray) => T = match => match as T,
  startIndex: number = 0
): Generator<T, void, undefined> {
  // Ensure the regex has the global flag for multiple matches
  const globalRegex = new RegExp(regex.source, regex.flags.replace('g', '') + 'g');
  
  // Set the starting position for the next match
  globalRegex.lastIndex = startIndex;

  // Find the next match
  const match = globalRegex.exec(content);

  if (match) {
    // If a match is found, yield the transformed match
    yield transform(match);

    // Recursively yield remaining matches, starting from the end of the current match
    yield* regexMatchGenerator(content, globalRegex, transform, globalRegex.lastIndex);
  }
  // If no match is found, the generator will automatically return
}

/**
 * Parses the sidebar items from the Astro config content.
 * @param content - The content of the Astro config file
 * @returns An array of SidebarItem objects
 */
function parseSidebarItems(content: string): Array<SidebarItem> {
  return match(content.match(SIDEBAR_REGEX))
    .with(P.not(P.nullish), (sidebarMatch) => {
      return Array.from(regexMatchGenerator(sidebarMatch[1], ITEM_REGEX), match => ({
        label: match[1],
        link: match[2]
      }));
    })
    .otherwise(() => []);
}

/**
 * Updates the Astro config file with a new sidebar item.
 * @param configPath - Path to the Astro config file
 * @param newItem - The new sidebar item to add
 */
async function updateAstroConfig(configPath: string, newItem: SidebarItem): Promise<void> {
  const content = await Deno.readTextFile(configPath);
  const existingItems = parseSidebarItems(content);
  const getExisitingItem = (link: string) => new RegExp(`(label:\s*['"])([^'"]+)(['"]\s*,\s*link:\s*['"]${link}['"])`);
  const pattern = getExisitingItem(newItem.link);

 
  const updateExisting = async (content: string) => {
    console.log(colors.yellow(`Item with link '${newItem.link}' already exists. Updating if necessary.`));
    const updatedContent = content.replace(pattern, `$1${newItem.label}$3`);

    if (updatedContent !== content) {
      await Deno.writeTextFile(configPath, updatedContent);
      console.log(colors.green(`Updated existing item: ${newItem.label}`));
    } 
    console.log(colors.blue(`No changes needed for: ${newItem.label}`));
  };

  const addNew = async (content: string) => {
    const updatedContent = content.replace(
      SIDEBAR_REGEX,
      (_, sidebarContent) => 
        `sidebar: [${sidebarContent}\n    { label: '${newItem.label}', link: '${newItem.link}' },]`
    );
    await Deno.writeTextFile(configPath, updatedContent);
    console.log(colors.green(`Added new item to Astro config: ${newItem.label}`));
  };

  await match({ existingItems, newItem, content })
    .with({ existingItems: P.array({ link: P.when(link => link === newItem.link) }) },
      ({ content }) => updateExisting(content))
    .otherwise(({ content }) => addNew(content));
}

/**
 * Processes a single README.md file: copies it to the guides directory and updates the Astro config.
 * @param entry - The file entry from the walk function
 * @param guidesDir - The destination guides directory
 * @param configPath - Path to the Astro config file
 */
async function processReadmeFile(
  entry: { path: string; name: string },
  guidesDir: string,
  configPath: string
): Promise<void> {
  const title = await getMarkdownTitle(entry.path);
  const sanitisedTitle = title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  const newFileName = `${sanitisedTitle}.md`;
  const newPath = join(guidesDir, newFileName);

  // Copy the file to the guides directory with the new name
  await Deno.copyFile(entry.path, newPath);
  console.log(colors.green(`Copied ${entry.path} to ${newPath}`));

  // Update the Astro config with the new sidebar item
  const link = `/guides/${sanitisedTitle}`;
  await updateAstroConfig(configPath, { label: title, link });
}

/**
 * Organises README.md files by copying them to the guides directory and updating the Astro config.
 * @param inputDir - The input directory to search for README.md files
 * @param outputDir - The base output directory
 * @param configPath - Path to the Astro config file
 */
async function organiseReadmeFiles(inputDir: string, outputDir: string, configPath: string): Promise<void> {
  const ignoreDirs = ['node_modules', '.git', 'dist', 'build', 'docs'];
  const guidesDir = join(outputDir, 'docs', 'guides');
  await ensureDir(guidesDir);

  // Walk through the input directory, ignoring specified directories
  const entries = walk(inputDir, { 
    match: [/README\.md$/i],
    skip: ignoreDirs.map(dir => new RegExp(`(^|${Deno.build.os === "windows" ? "\\" : "/"})(${dir})$`))
  });

  // Process each README.md file found
  for await (const entry of entries) {
    await match(entry)
      .with({ isFile: true }, (file) => processReadmeFile(file, guidesDir, configPath))
      .otherwise(() => {});
  }
}

/**
 * Checks if a file exists at the given path.
 * @param filePath - The path to check
 * @returns A boolean indicating whether the file exists
 */
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await Deno.stat(filePath);
    return true;
  } catch (error) {
    return match(error)
      .with(P.instanceOf(Deno.errors.NotFound), () => false)
      .otherwise(() => { throw error; });
  }
}

/**
 * The main function that runs the script.
 * Prompts for input and output directories, then organises the README.md files.
 */
async function main() {
  const inputDir = await Input.prompt({
    message: "Enter input directory path",
    default: "."
  });
  const outputDir = join("docs", "src", "content");
  const configPath = await Input.prompt({
    message: "Enter path to Astro config file (astro.config.mjs)",
    default: "./docs/astro.config.mjs"
  });

  // Check if the Astro config file exists
  await match(await fileExists(configPath))
    .with(true, async () => {
      await ensureDir(outputDir);
      await organiseReadmeFiles(inputDir, outputDir, configPath);
      console.log(colors.green("Organisation complete!"));
    })
    .otherwise(() => {
      console.error(colors.red(`Astro config file not found at ${configPath}`));
      Deno.exit(1);
    });
}

// Run the command
await new Command()
  .name("markdown-organiser")
  .description("Organises README.md files and updates Astro config")
  .action(main)
  .parse(Deno.args);
