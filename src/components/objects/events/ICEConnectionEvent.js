import Main from "../Main";
import { NODES, KEYS, KEY_TYPE } from "../../../modules/model";

class ICEConnectionEvent extends Main {
  static item = "ICE State Change";
  static description = "Handle ICE Connection state event";
  static icon = "bolt";
  static section = "events";
  static name = "ICEConnectionEvent";

  constructor(x, y) {
    super(x, y);
    this._inputs = 0;
    this._outputs = 1;
    this._info = [
      { key: KEYS.NODE, value: NODES.ICE },
      {
        key: KEYS.INFO,
        value: "Triggers actions to execute on ICE Connection state change!",
      },
    ];
    this._properties = [
      {
        prop: KEYS.ICESTATE,
        label: "State",
        type: KEY_TYPE.ENUM,
        enum: [
          { label: "Connected", value: "connected" },
          { label: "Disconnected", value: "disconnected" },
          { label: "Failed", value: "failed" },
        ],
        value: "connected",
        description: "Name of the State",
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
      case KEYS.ICESTATE: {
        const label = this.getLabelFromPropertySelect(property);
        return `on ${label}`;
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

  renderColorIsMissingProp(prop) {
    const property = this.getPropertyFor(prop);
    return property && property.value === "none";
  }

  render() {
    return `
      <div>
        <div class="title-box">
           <i class="fas fa-${this.constructor.icon}"></i> <span id="name-${
      this._uuid
    }">ON ICE STATE CHANGE</span>
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
            <i class="fas fa-chevron-right"></i>
            <span class="object-details-value" id="iceState-${
              this._uuid
            }">${this.renderProp(KEYS.ICESTATE)}</span>
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

export default ICEConnectionEvent;
