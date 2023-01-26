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
    this._accept = [];
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

  get node() {
    const infoNode = this._info.find((info) => info.key === "node");
    return infoNode ? infoNode.value : "Unknown";
  }

  getPropertyValueFor(name) {
    const property = this._properties.find(
      (property) => property.prop === name
    );
    return property ? property.value : "unknown";
  }

  updateValueFor(name, value) {
    const property = this._properties.find(
      (property) => property.prop === name
    );
    if (property) {
      property.value = value;
      if (name === "name") {
        this.updateName(value);
      }
    }
  }

  updateName(name) {
    const nameElt = document.querySelector(`#name-${this._uuid}`);
    if (nameElt) {
      nameElt.innerHTML = name;
    }
  }

  acceptConnection(node) {
    return this._accept.includes(node);
  }

  render() {
    return "";
  }
}

export default Main;
