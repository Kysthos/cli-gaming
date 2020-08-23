import { ScreenWriterInterface, ScreenDimensions } from "../ScreenWriter";
import { InputEventsInterface, KeyPress } from "../InputEvents";

export abstract class Game {
  protected abstract screenContent: string[];

  constructor(
    protected screenWriter: ScreenWriterInterface,
    protected inputEvents: InputEventsInterface
  ) {
    // setup some event listeners
    this.inputEvents.on("SIGINT", () => this.onSIGINT());
    this.inputEvents.on("KEYPRESS", (pressedObj) =>
      this.onKeyPress(pressedObj)
    );
    this.screenWriter.on("resize", (dimensions) =>
      this.onScreenResize(dimensions)
    );
  }

  /**
   * Prints the screenContent
   */
  protected print() {
    this.screenWriter.print(this.screenContent);
  }

  /**
   * Function called on each user keypress
   * @param keyPress
   */
  protected abstract onKeyPress(keyPress: KeyPress): void;

  /**
   * Function called when screen resizes
   * @param dimensions
   */
  protected abstract onScreenResize(dimensions: ScreenDimensions): void;

  /**
   * Function that will be called when user clicks ctrl+z
   */
  protected abstract onSIGINT(): void;
}
