import yargs from "yargs";
import { availableColors } from "../../colors";

const args = yargs
  .parserConfiguration({
    "duplicate-arguments-array": false,
  })
  .command("$0 [OPTIONS]", "Play snake in your terminal.")
  .option("s", {
    alias: "speed",
    demandOption: false,
    default: 100,
    describe: "refresh interval",
    type: "number",
  })
  .option("g", {
    alias: "head-color",
    demandOption: false,
    default: "red",
    describe: "snake's head color",
    type: "string",
  })
  .option("b", {
    alias: "body-color",
    demandOption: false,
    default: "blue",
    describe: "snake's body color",
    type: "string",
  })
  .option("e", {
    alias: "empty-color",
    demandOption: false,
    default: "black",
    describe: "color of an empty char",
    type: "string",
  })
  .option("f", {
    alias: "fruit-color",
    demandOption: false,
    default: "green",
    describe: "color of the fruit",
    type: "string",
  })
  .option("u", {
    alias: "filler-char",
    demandOption: false,
    default: " ",
    describe: "character to be used to build the board",
    type: "string",
  })
  .option("r", {
    alias: "rows",
    demandOption: false,
    default: undefined,
    describe: "number of rows",
    type: "number",
  })
  .option("c", {
    alias: "columns",
    demandOption: false,
    default: undefined,
    describe: "number of columns",
    type: "number",
  })
  .option("l", {
    alias: "list-colors",
    demandOption: false,
    default: false,
    describe: "List all possible colors",
    type: "boolean",
  })
  .check((argv) => {
    const {
      s: updateInterval,
      g: snakeHeadColor,
      b: snakeBodyColor,
      e: emptyColor,
      f: fruitColor,
      u: fillChar,
      r: rows,
      c: columns,
    } = argv;

    if (
      !availableColors.includes(snakeHeadColor) ||
      !availableColors.includes(snakeBodyColor) ||
      !availableColors.includes(emptyColor) ||
      !availableColors.includes(fruitColor)
    )
      throw new Error("invalid color name");

    if (fillChar.length > 1 || fillChar.length === 0)
      throw new Error("invalid fill char length");

    if (updateInterval <= 0) throw new Error("invalid update interval");

    return true;
  })
  .help("help")
  .alias("h", "help")
  .alias("v", "version").argv;

if (args.l) {
  console.log("Available colors:");
  console.log(
    availableColors
      .sort()
      .map((c) => "  " + c)
      .join("\n")
  );
  process.exit(2);
}

export { args };
