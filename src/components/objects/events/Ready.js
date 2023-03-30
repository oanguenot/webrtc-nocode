import Main from "../Main";
import { NODES, KEYS, KEY_TYPE } from "../../../modules/model";

class Ready extends Main {
  static item = "Ready";
  static description = "Handle playground ready";
  static icon = "bolt";
  static section = "events";
  static name = "Ready";

  constructor(x, y) {
    super(x, y);
    this._inputs = 0;
    this._outputs = 1;
    this._info = [
      { key: KEYS.NODE, value: NODES.READY },
      {
        key: KEYS.INFO,
        value: "Triggers actions to execute when the playground is ready!",
      },
    ];
    this._properties = [
      {
        prop: KEYS.DELAY,
        label: "Delay",
        type: KEY_TYPE.ENUM,
        enum: [
          { label: "Immediately", value: 0 },
          { label: "1 second", value: 1000 },
          { label: "2 seconds", value: 2000 },
          { label: "3 seconds", value: 3000 },
          { label: "5 seconds", value: 5000 },
          { label: "10 seconds", value: 10000 },
          { label: "15 seconds", value: 15000 },
          { label: "30 seconds", value: 30000 },
        ],
        value: 0,
        description: "Name of the Step",
      },
      {
        prop: KEYS.PEER,
        label: "Peer",
        type: KEY_TYPE.ENUM,
        enum: [{ label: "None", value: "none" }],
        value: "none",
        description: "Choose the RTCPeerConnection to execute an action",
      },
    ];
    this._acceptOutputs = [NODES.ACTIONS];
    this._acceptInputs = [];
    this._sources = [`${KEYS.NAME}:${KEYS.PEER}@${NODES.PEER}`];
    this._targets = [];
  }

  renderProp(prop) {
    const property = this.getPropertyFor(prop);
    const label = this.getLabelFromPropertySelect(property);

    switch (prop) {
      case KEYS.DELAY: {
        const label = this.getLabelFromPropertySelect(property);
        if (property.value === 0) {
          return `${label}`;
        }
        return `after ${label}`;
      }
      case KEYS.PEER: {
        if (property.value === "none") {
          return "No peer";
        }
        return `${label}`;
      }
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
    }">ON READY</span>
        </div>
        <div class="box">
            <div class="object-box-line">
            <i id="peer-color-${this._uuid}" class="fas fa-portrait ${
      this.renderColorIsMissingProp(KEYS.PEER) ? "red" : ""
    }"></i><span class="object-details-value ${
      this.renderColorIsMissingProp(KEYS.PEER) ? "red" : ""
    }" id="peer-${this._uuid}">${this.renderProp(KEYS.PEER)}</span>
          </div>
            <div class="object-box-line">
            <i class="fas fa-chevron-right"></i><span class="object-details-value" id="delay-${
              this._uuid
            }">${this.renderProp(KEYS.DELAY)}</span>
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

export default Ready;
