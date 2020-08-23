import { EventEmitter } from "events";

/**
 * Not ideal... Just need to figure out how to make
 * something like `BuiltInKeystrokes | string` show
 * actually the built in names...
 */
export interface KeyPress {
  name?: BuiltInKeystrokes;
  pressed: string;
}

export type KeyPressEventListener = (keyPress: KeyPress) => void;

export interface InputEventsInterface {
  on(event: "SIGINT", listener: () => void): this;
  on(event: "KEYPRESS", listener: KeyPressEventListener): this;
}

export type BuiltInKeystrokes =
  | "keyup"
  | "keydown"
  | "keyright"
  | "keyleft"
  | "space"
  | "enter"
  | "backspace"
  | "escape"
  | "tab"
  | "ctrl+d"
  | "ctrl+z";

const BUILTIN_KEYSTROKES: [BuiltInKeystrokes, Buffer][] = [
  ["keydown", Buffer.from([0x1b, 0x5b, 0x42])],
  ["keyup", Buffer.from([0x1b, 0x5b, 0x41])],
  ["keyright", Buffer.from([0x1b, 0x5b, 0x43])],
  ["keyleft", Buffer.from([0x1b, 0x5b, 0x44])],
  ["space", Buffer.from([0x20])],
  ["enter", Buffer.from([0x0d])],
  ["backspace", Buffer.from([0x7f])],
  ["escape", Buffer.from([0x1b])],
  ["tab", Buffer.from([0x09])],
  ["ctrl+d", Buffer.from([0x04])],
  ["ctrl+z", Buffer.from([0x1a])],
];

const ctrlZBuffer = Buffer.from([0x3]);

/**
 * Instance of this class will emit a `KEYPRESS` event on each user input
 * `SIGINT` event will be called when user clicks ctrl+c
 */
export class InputEvents extends EventEmitter implements InputEventsInterface {
  constructor() {
    super();

    // set raw mode on stdin to register each keypress
    process.stdin.setRawMode(true);

    // listen for ctrl+c (SIGINT event is not fired
    // on the process object when raw mode is set on stdin)
    process.stdin.on("data", (chunk) => {
      if (chunk.equals(ctrlZBuffer)) {
        this.emit("SIGINT");
        return;
      }
      this.emit("KEYPRESS", {
        name: this.checkKeystroke(chunk),
        pressed: chunk.toString(),
      });
    });
  }

  on(event: "SIGINT", listener: () => void): this;
  on(event: "KEYPRESS", listener: KeyPressEventListener): this;
  on(event: string, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }

  /**
   * Checks if user clicked some of the BuiltInKeystrokes
   * as defined in BUILTIN_KEYSTROKES
   * @param buf
   */
  private checkKeystroke(buf: Buffer): BuiltInKeystrokes | void {
    for (const [name, buffer] of BUILTIN_KEYSTROKES)
      if (buf.equals(buffer)) return name;
    return undefined;
  }
}
