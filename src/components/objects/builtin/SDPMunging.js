import Main from "../Main";
import { KEY_TYPE, KEYS, NODES } from "../../../modules/model";
import { mungle } from "../../../modules/sdp";
import { generateCustomId4 } from "../../../modules/helper";

class SDPMunging extends Main {
  static item = "SDP Munging";
  static description = "Modify the SDP prior to use";
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
    this._properties = [
      {
        prop: KEYS.NAME,
        label: "Name",
        type: KEY_TYPE.TEXT,
        value: `SDP-${generateCustomId4()}`,
        description: "Action/Name",
        default: "SDP",
      },
      {
        prop: KEYS.OPERATION,
        label: "Operation",
        type: KEY_TYPE.ENUM,
        enum: [
          { label: "None", value: "none" },
          { label: "RRTR", value: "rrtr" },
          //{ label: "No Bundle", value: "nobundle" },
        ],
        value: "none",
        description: "Choose the operation to apply on the SDP",
      },
    ];
    this._sources = [];
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

  execute(peerId, frames, offer, reporter) {
    return new Promise((resolve, reject) => {
      const operation = this.getPropertyValueFor(KEYS.OPERATION);
      reporter({
        win: frames[peerId],
        name: "mungle",
        category: "api",
        details: "Munge the SDP",
        ssrc: null,
        data: { operation },
        timestamp: Date.now(),
        ended: null,
      });

      const updatedOffer = mungle(operation, offer);
      resolve(updatedOffer);
    });
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
