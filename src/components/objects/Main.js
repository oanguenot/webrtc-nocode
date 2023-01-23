import { v4 as uuidv4 } from "uuid";

class Main {
  constructor(posX = 0, posY = 0) {
    this._icon = "";
    this._inputs = 1;
    this._outputs = 1;
    this._info = {};
    this._properties = {};
    this._posX = posX;
    this._posY = posY;
    this._uuid = uuidv4();
  }

  get inputs() {
    return this._inputs;
  }

  get outputs() {
    return this._outputs;
  }

  get info() {
    return this._info;
  }

  get properties() {
    return this._properties;
  }

  get x() {
    return this._posX;
  }

  get y() {
    return this._posY;
  }

  set positionX(value) {
    this._posX = value;
  }

  set positionY(value) {
    this._posY = value;
  }

  get id() {
    return this._uuid;
  }

  render() {
    return "";
  }
}

export default Main;
