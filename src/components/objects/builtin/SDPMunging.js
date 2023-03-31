import Main from "../Main";
import { KEY_TYPE, KEYS, NODES } from "../../../modules/model";
import { customAlphabet } from "nanoid";

const CUSTOM_ALPHABET = "0123456789abcdef";
const nanoid = customAlphabet(CUSTOM_ALPHABET, 4);

class SDPMunging extends Main {
  static item = "SDPMunging";
  static description = "Mungle SDP";
  static icon = "vial";
  static section = "builtin";
  static name = "SDPMunging";

  constructor(x, y) {
    super(x, y);
    this._inputs = 0;
    this._outputs = 1;
    this._info = [
      { key: KEYS.NODE, value: NODES.MUNGING },
      {
        key: KEYS.INFO,
        value: "Modify the SDP when negotiating the call",
      },
    ];
    this._acceptInputs = [];
    this._acceptOutputs = [NODES.CALL];
    this._properties = [
      {
        prop: KEYS.NAME,
        label: "Name",
        type: KEY_TYPE.TEXT,
        value: `SDP-${nanoid()}`,
        description: "Action/Name",
      },
      {
        prop: KEYS.OPERATION,
        label: "Operation",
        type: KEY_TYPE.ENUM,
        enum: [
          { label: "None", value: "none" },
          { label: "RRTR", value: "rrtr" },
        ],
        value: "none",
        description: "Choose the operation to apply on the SDP",
      },
    ];
    this._sources = [];
    this._targets = [];
  }

  renderProp(prop) {
    const property = this.getPropertyFor(prop);
    const label = this.getLabelFromPropertySelect(property);

    switch (prop) {
      case KEYS.NAME:
        return property.value;
      case KEYS.OPERATION:
        return property.value === "none" ? "no operation" : `${label}`;
      default:
        return "";
    }
  }

  render() {
    return `
      <div>
        <div class="title-box">
          <i class="fas fa-${this.constructor.icon}"></i> <span id="name-${
      this._uuid
    }">${this.renderProp(KEYS.NAME)}</span>
        </div>
        <div class="box">
        <div class="object-box-line">
            <i id="operation-color-${
              this._uuid
            }" class="fas fa-prescription-bottle ${
      this.renderColorIsMissingProp(KEYS.OPERATION) ? "red" : ""
    }"></i><span class="object-details-value ${
      this.renderColorIsMissingProp(KEYS.OPERATION) ? "red" : ""
    }" id="operation-${this._uuid}">${this.renderProp(KEYS.OPERATION)}</span>
            </div>
            <div class="object-footer">
                <span class="object-node object-title-box">${
                  this.node
                }</span>    
            </div>
        </div>
      </div>
    `;
  }
}

export default SDPMunging;
