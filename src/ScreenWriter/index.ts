import { EventEmitter } from "events";
import chalk from "chalk";
import cliCursor from "cli-cursor";
import stripAnsi from "strip-ansi";
import { getBackgroundColor, getForegroundColor, Color } from "../colors";

export interface ScreenWriterInterface {
  print(strings: string[]): void;
  addBorder(strings: string[]): string[];
  on(event: "resize", listener: ResizeEventListener): this;
  centerString(str: string, lineWidth: number, fillChar?: string): string;
  clearScreen(): void;
  columns: number;
  rows: number;
}

interface ScreenWriterOptions {
  withBorder?: boolean;
  borderColor?: Color | null;
  borderBgColor?: Color | null;
}

type ResizeEventListener = (newScreenDimensions: ScreenDimensions) => void;

export type ScreenDimensions = {
  columns: number;
  rows: number;
};

export class ScreenWriter extends EventEmitter
  implements ScreenWriterInterface {
  /** console columns */
  private _columns: number = 0;
  /** console rows */
  private _rows: number = 0;

  /** chalk function used to color the border */
  borderColor: chalk.Chalk | undefined;

  /** should the border be added */
  private _border = true;

  /** used to determine which lines should be redrawn */
  private previousLines: string[] = [];

  constructor(opts: ScreenWriterOptions = {}) {
    super();

    this.updateScreenSize(true);
    // listen for screen resize
    process.stdout.on("resize", () => this.updateScreenSize());

    if (opts.withBorder !== undefined) this._border = opts.withBorder;

    // get border color
    const borderColor =
      opts.borderColor !== null ? opts.borderColor || "white" : null;
    const borderBgColor =
      opts.borderBgColor !== null ? opts.borderBgColor || "black" : null;
    if (!borderBgColor && !borderColor) this._border = false;
    else if (borderBgColor && borderColor)
      this.borderColor =
        chalk[getForegroundColor(borderColor)][
          getBackgroundColor(borderBgColor)
        ];
    else if (borderColor)
      this.borderColor = chalk[getForegroundColor(borderColor)];
    else if (borderBgColor)
      this.borderColor = chalk[getBackgroundColor(borderBgColor)];
  }

  on(event: "resize", listener: ResizeEventListener): this {
    return super.on(event, listener);
  }

  private updateScreenSize(noEmit = false) {
    const [columns, rows] = process.stdout.getWindowSize();
    this._columns = columns;
    this._rows = rows;
    this.previousLines = [];

    if (!noEmit) this.emit("resize", { columns, rows });
  }

  /**
   * Returns number of columns available to write to
   * Takes border into account
   */
  get columns() {
    return this._border ? this._columns - 2 : this._columns;
  }

  /**
   * Returns number of rows available to write to
   * Takes border into account
   */
  get rows() {
    return this._border ? this._rows - 2 : this._rows;
  }

  /**
   * Centers lines on screen if needed
   * @param strings
   */
  centerStringsOnScreen(strings: string[]) {
    const rows = this._rows;
    const columns = this._columns;

    if (strings.length === rows && stripAnsi(strings[0]).length === columns)
      return strings;

    const emptyLine = " ".repeat(columns);

    const emptyLinesNeeded = (rows - strings.length) / 2;

    return [
      ...Array(Math.floor(emptyLinesNeeded)).fill(emptyLine),
      ...strings.map((str) => this.centerString(str, columns)),
      ...Array(Math.ceil(emptyLinesNeeded)).fill(emptyLine),
    ];
  }

  clearScreen() {
    this.previousLines = [];
    console.clear();
  }

  /**
   * helper function to center text
   * @param str string to be centered
   * @param lineWidth desired line width
   * @param fillChar Character to be used as a filler, default: ' '
   */
  centerString(str: string, lineWidth: number = this._columns, fillChar = " ") {
    if (lineWidth <= 0)
      throw new RangeError(
        `Line width should be bigger than 0. Received: ${lineWidth}`
      );

    const strippedStr = stripAnsi(str);

    if (strippedStr.length === lineWidth) return str;
    // WRONG, how to properly strip a string with ansi chars?
    if (strippedStr.length > lineWidth) return strippedStr.slice(0, lineWidth);

    const padding = (lineWidth - strippedStr.length) / 2;

    return (
      fillChar.repeat(Math.floor(padding)) +
      str +
      fillChar.repeat(Math.ceil(padding))
    );
  }

  /**
   * Write to stdout
   * The assumption is all strings in the array are the same width
   * @param strings Array of strings to write
   */
  print(strings: string[]) {
    if (this._border) strings = this.addBorder(strings);
    strings = this.centerStringsOnScreen(strings);

    for (let i = 0; i < strings.length; i++) {
      const row = strings[i];
      // we'll be redrawing only changed lines
      if (row !== this.previousLines[i]) {
        process.stdout.cursorTo(0, i);
        process.stdout.write(row);
        if (i < strings.length - 1) process.stdout.write("\n");
        this.previousLines[i] = row;
      }
    }

    cliCursor.hide();
  }

  addBorder(arr: string[]) {
    if (!this._border || !this.borderColor) return arr;

    const sideBorder = this.borderColor("│");
    const lineWidth = stripAnsi(arr[0]).length;
    return [
      // top border
      this.borderColor("┌" + "─".repeat(lineWidth) + "┐"),
      // add left and right borders
      ...arr.map((row) => sideBorder + row + sideBorder),
      // bottom border
      this.borderColor("└" + "─".repeat(lineWidth) + "┘"),
    ];
  }
}
