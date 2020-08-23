import chalk from "chalk";
import humanizeDuration from "humanize-duration";
import { Game } from "../AbstractGame";
import { InputEventsInterface, KeyPress } from "../../InputEvents";
import { ScreenWriterInterface } from "../../ScreenWriter";
import { Color, getBackgroundColor, getForegroundColor } from "../../colors";

/**
 * Get a random int
 * @param min integer
 * @param max integer (not inclusive)
 */
const getRandomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min)) + min;

/** Union type for possible directions */
type Direction = "up" | "down" | "left" | "right";

/** Position of any element: [row, column] */
type Position = [number, number];

export interface SnakeOpts {
  updateInterval?: number;
  snakeHeadColor?: Color;
  snakeBodyColor?: Color;
  emptyColor?: Color;
  fruitColor?: Color;
  fillChar?: string;
  columns?: number;
  rows?: number;
}
export class Snake extends Game {
  screenContent: string[] = [];

  /** character to be used for each element on the board */
  private fillChar: string;

  /** array of row arrays */
  private board: Color[][] = [];

  /** console columns */
  private columns: number = 0;
  private customColumns: boolean = false;
  /** console rows */
  private rows: number = 0;
  private customRows: boolean = false;

  private updateInterval: number;

  /** start of the game */
  private startTime = Date.now();

  // colors
  private snakeHeadColor: Color;
  private snakeBodyColor: Color;
  private emptyColor: Color;
  private fruitColor: Color;
  private endScreenBgColor: Color = "red";
  private endScreenColor: Color = "white";

  /** number of eaten fruits */
  private fruitsEaten = 0;

  /** current direction of the snake */
  private dir: Direction = "right";

  private phase: "game" | "end" | "init" = "init";

  // Elements to be positioned on the board
  private snakeHead: Position = [1, 1];
  private snakeBody: Position[] = [];
  private fruitPosition: Position = [0, 0];

  /** array of all possible position tuples... MEMORY WASTE */
  private fieldsAvailabe: Position[] = [];

  /** store last setTimeout call */
  private currTimeout: NodeJS.Timeout = setTimeout(() => {}, 0);

  constructor(
    screenWriter: ScreenWriterInterface,
    inputEvents: InputEventsInterface,
    opts: SnakeOpts = {}
  ) {
    super(screenWriter, inputEvents);

    this.updateInterval = opts.updateInterval || 100;
    this.snakeHeadColor = opts.snakeHeadColor || "red";
    this.snakeBodyColor = opts.snakeBodyColor || "blue";
    this.emptyColor = opts.emptyColor || "black";
    this.fruitColor = opts.fruitColor || "green";
    this.fillChar = opts.fillChar || " ";
    if (opts.columns) {
      this.columns = opts.columns;
      this.customColumns = true;
    }
    if (opts.rows) {
      this.rows = opts.rows;
      this.customColumns = true;
    }

    // whole setup wrapped in another function to easily restart
    this.init();
  }

  //================================================================
  //======================= INITIAL SETUP ==========================
  //================================================================

  /** initial setup of the game */
  init() {
    this.phase = "init";

    // set some starting values
    this.setStartingValues();

    // check the size of the terminal
    this.setBoardSize();

    // SO INEFFICIENT... THIS SHOULD BE CHANGED
    // we're storing all possible position tuples
    // so it would be to pick available position for the fruit...
    for (let row = 0; row < this.rows; row++)
      for (let column = 0; column < this.columns; column++)
        this.fieldsAvailabe.push([row, column]);

    // place first fruit
    this.placeFruit();

    // record starting time of the game
    this.startTime = Date.now();

    // start the loop
    this.phase = "game";
    this.start();
  }

  setBoardSize() {
    this.columns = this.customColumns
      ? this.columns
      : this.screenWriter.columns;
    this.rows = this.customRows ? this.rows : this.screenWriter.rows;
  }

  onKeyPress(keyPress: KeyPress) {
    switch (this.phase) {
      case "init":
        return;
      case "game":
        this.handleGameInput(keyPress);
        return;
      case "end":
        this.handleEndScreenInput(keyPress);
        return;
    }
  }

  handleGameInput({ name, pressed }: KeyPress) {
    if (name === "keyup" || pressed === "w") {
      this.updateDir("up");
      return;
    }

    if (name === "keydown" || pressed === "s") {
      this.updateDir("down");
      return;
    }

    if (name === "keyright" || pressed === "d") {
      this.updateDir("right");
      return;
    }

    if (name === "keyleft" || pressed === "a") {
      this.updateDir("left");
      return;
    }
  }

  handleEndScreenInput({ pressed }: KeyPress) {
    if (pressed === "r") {
      this.reset();
      return;
    }

    if (pressed === "q") {
      this.screenWriter.clearScreen();
      process.exit(0);
    }
  }

  onSIGINT() {
    this.screenWriter.clearScreen();
    process.exit(1);
  }

  onScreenResize() {
    this.reset();
  }

  /** All default, non-option values should go here  */
  setStartingValues() {
    this.dir = "right";
    this.snakeHead = [1, 1];
    this.snakeBody = [];
    this.fruitsEaten = 0;
    this.screenContent = [];
    clearTimeout(this.currTimeout);
  }

  /** Function that is called on each refresh of the game */
  start() {
    // first let's update snake's postion
    this.updateSnakePosition();

    // next update snake and fruit position on the board
    this.updateBoard();

    // if the game has actually ended, stop here
    if (this.phase !== "game") return;

    // print/update the board
    this.print();

    // schedule next refresh of the game
    this.currTimeout = setTimeout(() => this.start(), this.updateInterval);
  }

  reset() {
    this.init();
  }

  createEmptyBoard() {
    this.board = Array(this.rows)
      .fill(null)
      .map(() => Array(this.columns).fill(this.emptyColor));
  }

  //================================================================
  //========================= GAME OVER ============================
  //================================================================

  gameOver() {
    // this will stop setting another setTimeout
    this.phase = "end";

    // get chalk function to color the text
    const color =
      chalk[getForegroundColor(this.endScreenColor)][
        getBackgroundColor(this.endScreenBgColor)
      ];

    // end screen messages
    const messages = [
      // score
      `Your score: ${this.fruitsEaten}`,
      // play time
      `Play time: ${humanizeDuration(Date.now() - this.startTime)}`,
      // user options
      'Press "r" to play again or "q" to exit.',
    ].map((line) =>
      color(this.screenWriter.centerString(line, this.columns, this.fillChar))
    );

    // how many lines should be below and above the end screen messages
    // so they are centered vertically
    const emptyLinesCount = (this.rows - messages.length) / 2;

    // filler, empty line
    const emptyLine = color(this.fillChar.repeat(this.columns));

    this.screenContent = [
      ...Array(Math.floor(emptyLinesCount)).fill(emptyLine),
      ...messages,
      ...Array(Math.ceil(emptyLinesCount)).fill(emptyLine),
    ];

    this.print();
  }

  //================================================================
  //===================== UPDATE FUNCTIONS =========================
  //================================================================

  /**
   * Updates snake's direction
   * @param dir
   */
  updateDir(dir: Direction) {
    switch (dir) {
      case "up":
        if (this.dir === "down") return;
        this.dir = dir;
        break;
      case "down":
        if (this.dir === "up") return;
        this.dir = dir;
        break;
      case "right":
        if (this.dir === "left") return;
        this.dir = dir;
        break;
      case "left":
        if (this.dir === "right") return;
        this.dir = dir;
        break;
    }
  }

  /** function to update positions of all elements on the board */
  updateBoard() {
    // first we create an empty board
    // not sure if it's the best approach
    this.createEmptyBoard();

    // update fruit position
    let [row, col] = this.fruitPosition;
    this.board[row][col] = this.fruitColor;

    // update snake head position
    [row, col] = this.snakeHead;
    this.board[row][col] = this.snakeHeadColor;

    // update snake body position
    for (let [row, col] of this.snakeBody)
      this.board[row][col] = this.snakeBodyColor;

    this.updateScreenContent();
  }

  /** INEFFICIENT */
  placeFruit() {
    // a lot of overhead
    // first filter an array of all possible positions on the board
    const snake = [this.snakeHead, ...this.snakeBody];
    const available = this.fieldsAvailabe.filter((pos) => {
      for (const bodyPart of snake)
        if (this.checkColision(pos, bodyPart)) return false;
      return true;
    });

    // if no positions available, end the game
    if (available.length === 0) {
      this.gameOver();
      return;
    }

    // pick random position for the fruit
    this.fruitPosition = available[getRandomInt(0, available.length)];
  }

  /** helper function to check if two positions are the same */
  checkColision(pos1: Position, pos2: Position) {
    if (pos1[0] === pos2[0] && pos1[1] === pos2[1]) return true;
    return false;
  }

  /** helper function to check if snake's head collide with any body part */
  checkSnakeBodyColision() {
    for (const bodyPart of this.snakeBody)
      if (this.checkColision(this.snakeHead, bodyPart)) this.gameOver();
  }

  /** function to update the whole snake's position */
  updateSnakePosition() {
    this.updateBodyPosition();
    this.updateHeadPosition();
    this.checkSnakeBodyColision();
  }

  /** function to update snake's head position */
  updateHeadPosition() {
    let [row, col] = this.snakeHead;
    switch (this.dir) {
      case "up":
        row--;
        break;
      case "down":
        row++;
        break;
      case "right":
        col++;
        break;
      case "left":
        col--;
        break;
    }

    // check if out of bounds
    if (col >= this.columns || col < 0 || row >= this.rows || row < 0) {
      this.gameOver();
      return;
    }

    this.snakeHead = [row, col];
  }

  /** function to update snake's body position */
  updateBodyPosition() {
    if (this.checkColision(this.snakeHead, this.fruitPosition)) {
      this.fruitsEaten++;
      this.snakeBody = [this.snakeHead, ...this.snakeBody];
      this.placeFruit();
      return;
    }

    if (this.snakeBody.length === 0) return;

    this.snakeBody = [
      this.snakeHead,
      ...this.snakeBody.slice(0, this.snakeBody.length - 1),
    ];
  }

  /** Updates screenContent based on the content of the board */
  updateScreenContent() {
    this.screenContent = this.board.map((row) =>
      row
        .map((field) => {
          const bgColor = getBackgroundColor(field);
          return chalk[bgColor](this.fillChar);
        })
        .join("")
    );
  }
}
