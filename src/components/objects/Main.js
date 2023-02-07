import { v4 as uuidv4 } from "uuid";

class Main {
  static item = "a name"; // Used in the menu
  static description = "a description"; // Used in the menu
  static icon = "an icon"; // Used in the menu
  static section = "section"; // Can be Basic, BuiltIn, External

  constructor(posX = 0, posY = 0) {
    this._inputs = 1;
    this._outputs = 1;
    this._linksInputs = [];
    this._linksOutputs = [];
    this._info = {};
    this._properties = {};
    this._posX = posX;
    this._posY = posY;
    this._uuid = uuidv4();
    this._acceptInputs = [];
    this._acceptOutputs = [];
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

  get links() {
    return this._linksInputs;
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

  get acceptInput() {
    return this._acceptInputs;
  }

  get acceptOutput() {
    return this._acceptOutputs;
  }

  get node() {
    const infoNode = this._info.find((info) => info.key === "node");
    return infoNode ? infoNode.value : "Unknown";
  }

  getInfoValueFor(name) {
    const info = this._info.find((info) => info.key === name);
    return info ? info.value : "unknown";
  }

  getPropertyValueFor(name) {
    const property = this._properties.find(
      (property) => property.prop === name
    );
    return property ? property.value : "unknown";
  }

  getPropertyFor(name) {
    return this._properties.find((property) => property.prop === name);
  }

  getLabelFromPropertySelect(property) {
    if (property) {
      const value = property.value;
      return property.enum.find((item) => item.value === value).label;
    }
    return "???";
  }

  updateValueFor(name, value, label) {
    const property = this._properties.find(
      (property) => property.prop === name
    );
    if (property) {
      property.value = value;
      this.updateDisplayInObject(name, label || value);
    }
  }

  updateDisplayInObject(propertyName, value) {
    const nameElt = document.querySelector(`#${propertyName}-${this._uuid}`);
    if (nameElt) {
      nameElt.innerHTML = value;
    }
  }

  acceptInputConnection(node) {
    if (this._acceptInputs.includes("*")) {
      return true;
    }
    return this._acceptInputs.includes(node);
  }

  acceptOutputConnection(node) {
    if (this._acceptOutputs.includes("*")) {
      return true;
    }
    return this._acceptOutputs.includes(node);
  }

  addInputLink(nodeId) {
    if (!this._linksInputs.includes(nodeId)) {
      this._linksInputs.push(nodeId);
    } else {
      console.warn(
        `[main] connection already added from ${nodeId} to ${this._uuid}`
      );
    }
  }

  addOutputLink(nodeId) {
    if (!this._linksOutputs.includes(nodeId)) {
      this._linksOutputs.push(nodeId);
    } else {
      console.warn(
        `[main] connection already added from ${nodeId} to ${this._uuid}`
      );
    }
  }

  render() {
    return "";
  }
}

export default Main;
