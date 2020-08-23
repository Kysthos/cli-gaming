import { ScreenWriter } from "./ScreenWriter";
import { InputEvents } from "./InputEvents";
import { Snake } from "./Games/Snake";
import { Color } from "./colors";
import { args } from "./Games/Snake/parseArgs";
const {
  s: updateInterval,
  g: snakeHeadColor,
  b: snakeBodyColor,
  e: emptyColor,
  f: fruitColor,
  u: fillChar,
  r: rows,
  c: columns,
} = args;

const screenWriter = new ScreenWriter();
const inputEvents = new InputEvents();
const snake = new Snake(screenWriter, inputEvents, {
  updateInterval,
  snakeHeadColor: snakeHeadColor as Color,
  snakeBodyColor: snakeBodyColor as Color,
  emptyColor: emptyColor as Color,
  fruitColor: fruitColor as Color,
  fillChar,
  columns,
  rows,
});
