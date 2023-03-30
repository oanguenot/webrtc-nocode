import Main from "../Main";
import { KEY_TYPE, KEYS, NODES } from "../../../modules/model";
import { customAlphabet } from "nanoid";

const CUSTOM_ALPHABET = "0123456789abcdef";
const nanoid = customAlphabet(CUSTOM_ALPHABET, 4);

class SDPMunging extends Main {
  static item = "SDPMunging";
  static description = "Mungle SDP";
  static icon = "vial";
  static section = "actions";
  static name = "SDPMunging";

  constructor(x, y) {
    super(x, y);
    this._inputs = 1;
    this._outputs = 1;
    this._info = [
      { key: KEYS.NODE, value: NODES.MUNGING },
      {
        key: KEYS.INFO,
        value: "Modify the SDP when negotiating the call",
      },
    ];
    this._acceptInputs = [NODES.EVENTS, NODES.ACTIONS];
    this._acceptOutputs = [NODES.ACTIONS];
    this._properties = [
      {
        prop: KEYS.NAME,
        label: "Name",
        type: KEY_TYPE.TEXT,
        value: `SDP-${nanoid()}`,
        description: "Action/Name",
      },
      {
        prop: KEYS.CALL,
        label: "Call",
        type: KEY_TYPE.ENUM,
        enum: [{ label: "None", value: "none" }],
        value: "none",
        description: "Choose the call to update",
      },
    ];
    this._sources = [`${KEYS.NAME}:${KEYS.CALL}@${NODES.CALL}`];
    this._targets = [];
  }

  renderProp(prop) {
    const property = this.getPropertyFor(prop);
    const label = this.getLabelFromPropertySelect(property);

    switch (prop) {
      case KEYS.NAME:
        return property.value;
      case KEYS.CALL:
        return property.value === "none" ? "no call" : `${label}`;
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
    }">${this.renderProp("name")}</span>
        </div>
        <div class="box">
        <div class="object-box-line">
            <i id="call-color-${this._uuid}" class="fas fa-phone-volume ${
      this.renderColorIsMissingProp(KEYS.CALL) ? "red" : ""
    }"></i><span class="object-details-value ${
      this.renderColorIsMissingProp(KEYS.CALL) ? "red" : ""
    }" id="call-${this._uuid}">${this.renderProp(KEYS.CALL)}</span>
            </div>
            <div class="object-footer">
                <span class="object-node object-title-box">${
                  this._info[0].value
                }.${this._uuid}</span>    
            </div>
        </div>
      </div>
    `;
  }
}

export default SDPMunging;
