import { ForegroundColor, BackgroundColor } from "chalk";

interface ColorObj {
  fg: typeof ForegroundColor;
  bg: typeof BackgroundColor;
}

interface Colors {
  black: ColorObj;
  red: ColorObj;
  green: ColorObj;
  yellow: ColorObj;
  blue: ColorObj;
  magenta: ColorObj;
  cyan: ColorObj;
  white: ColorObj;
  gray: ColorObj;
  grey: ColorObj;
  blackBright: ColorObj;
  redBright: ColorObj;
  greenBright: ColorObj;
  yellowBright: ColorObj;
  blueBright: ColorObj;
  magentaBright: ColorObj;
  cyanBright: ColorObj;
  whiteBright: ColorObj;
}

const COLORS: Colors = {
  black: { fg: "black", bg: "bgBlack" },
  red: { fg: "red", bg: "bgRed" },
  green: { fg: "green", bg: "bgGreen" },
  yellow: { fg: "yellow", bg: "bgYellow" },
  blue: { fg: "blue", bg: "bgBlue" },
  magenta: { fg: "magenta", bg: "bgMagenta" },
  cyan: { fg: "cyan", bg: "bgCyan" },
  white: { fg: "white", bg: "bgWhite" },
  gray: { fg: "gray", bg: "bgGray" },
  grey: { fg: "grey", bg: "bgGrey" },
  blackBright: { fg: "blackBright", bg: "bgBlackBright" },
  redBright: { fg: "redBright", bg: "bgRedBright" },
  greenBright: { fg: "greenBright", bg: "bgGreenBright" },
  yellowBright: { fg: "yellowBright", bg: "bgYellowBright" },
  blueBright: { fg: "blueBright", bg: "bgBlueBright" },
  magentaBright: { fg: "magentaBright", bg: "bgMagentaBright" },
  cyanBright: { fg: "cyanBright", bg: "bgCyanBright" },
  whiteBright: { fg: "whiteBright", bg: "bgWhiteBright" },
};

export type Color = keyof Colors;

export const availableColors = [
  "magentaBright",
  "black",
  "red",
  "green",
  "yellow",
  "blue",
  "magenta",
  "cyan",
  "white",
  "gray",
  "grey",
  "blackBright",
  "redBright",
  "greenBright",
  "yellowBright",
  "blueBright",
  "cyanBright",
  "whiteBright",
];

/**
 * Get a chalk acceptable foreground color
 * @param color
 */
export const getForegroundColor = (color: Color): typeof ForegroundColor =>
  COLORS[color].fg;

/**
 * Get a chalk acceptable background color
 * @param color
 */
export const getBackgroundColor = (color: Color): typeof BackgroundColor =>
  COLORS[color].bg;
