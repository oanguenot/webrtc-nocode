import { customAlphabet } from "nanoid";
import { getNodeById, includes } from "../../modules/helper";
import { KEYS } from "../../modules/model";

const CUSTOM_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";
const nanoid = customAlphabet(CUSTOM_ALPHABET, 6);

class Main {
  static item = "a name"; // Used in the menu
  static description = "a description"; // Used in the menu
  static icon = "an icon"; // Used in the menu
  static section = "section"; // Can be Basic, BuiltIn, External
  static name = "Main";

  constructor(posX = 0, posY = 0) {
    this._inputs = 1;
    this._outputs = 1;
    this._linksInputs = [];
    this._linksOutputs = [];
    this._info = {};
    this._properties = {};
    this._posX = posX;
    this._posY = posY;
    this._uuid = nanoid();
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

  get linksInput() {
    return this._linksInputs;
  }

  get linksOutput() {
    return this._linksOutputs;
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
    const infoNode = this._info.find((info) => info.key === KEYS.NODE);
    return infoNode ? infoNode.value : "Unknown";
  }

  get kind() {
    const infoNode = this._info.find((info) => info.key === KEYS.KIND);
    return infoNode ? infoNode.value : null;
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
      if (!property.enum) {
        return "";
      }
      const enumItem = property.enum.find((item) => item.value === value);
      return enumItem ? enumItem.label : "???";
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

  renderProp() {
    return "";
  }

  renderColorIsMissingProp() {
    return false;
  }

  updateDisplayInObject(propertyName) {
    const isMissing = this.renderColorIsMissingProp(propertyName);
    const nameElt = document.querySelector(`#${propertyName}-${this._uuid}`);
    if (nameElt) {
      nameElt.innerHTML = this.renderProp(propertyName);
      if (nameElt.classList.contains("red") && !isMissing) {
        nameElt.classList.remove("red");
      } else if (!nameElt.classList.contains("red") && isMissing) {
        nameElt.classList.add("red");
      }
    }
    const nameColorElt = document.querySelector(
      `#${propertyName}-color-${this._uuid}`
    );
    if (nameColorElt) {
      if (nameColorElt.classList.contains("red") && !isMissing) {
        nameColorElt.classList.remove("red");
      } else if (!nameColorElt.classList.contains("red") && isMissing) {
        nameColorElt.classList.add("red");
      }
    }
  }

  acceptInputConnection(nodeName) {
    if (this._linksInputs.length >= this._inputs) {
      return false;
    }
    if (this._acceptInputs.includes("*")) {
      return true;
    }

    const accepts = this._acceptInputs.map((acceptName) =>
      acceptName.replace(/.\*$/, "")
    );
    return includes(nodeName, accepts);
  }

  acceptOutputConnection(nodeName) {
    if (this._linksOutputs.length >= this._outputs) {
      return false;
    }
    if (this._acceptOutputs.includes("*")) {
      return true;
    }
    const accepts = this._acceptOutputs.map((acceptName) =>
      acceptName.replace(/.\*$/, "")
    );
    return includes(nodeName, accepts);
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

  removeInputLink(nodeId) {
    this._linksInputs = this._linksInputs.filter((input) => input !== nodeId);
  }

  removeOutputLink(nodeId) {
    this._linksOutputs = this._linksOutputs.filter((input) => input !== nodeId);
  }

  addNewOptionToSelect(value, label, propertyName) {
    const prop = this._properties.find(
      (property) => property.prop === propertyName
    );
    const existingSteps = prop.enum;
    const found = existingSteps.find((step) => [value].includes(step.value));
    if (!found) {
      existingSteps.push({ label, value });
    }
  }

  addMultipleOptionsToSelect(options, propertyName) {
    options.forEach((option) =>
      this.addNewOptionToSelect(option.value, option.label, propertyName)
    );
  }

  updateLabelInSelect(value, label, propertyName) {
    const prop = this._properties.find(
      (property) => property.prop === propertyName
    );
    const existingSteps = prop.enum;
    existingSteps.forEach((step) => {
      if (step.value === value) {
        step.label = label;
      }
    });
    if (prop.value === value) {
      this.updateDisplayInObject(propertyName, label);
    }
  }

  render() {
    return "";
  }

  rehydrate(fromNode) {
    this._uuid = fromNode._uuid;
    this._linksOutputs = fromNode._linksOutputs;
    this._linksInputs = fromNode._linksInputs;
    this._properties = fromNode._properties;
  }

  getNextNode(nodes, index = 0) {
    if (this._linksOutputs.length === 0) {
      return null;
    }

    const id = this._linksOutputs[index];
    return getNodeById(id, nodes);
  }
}

export default Main;
