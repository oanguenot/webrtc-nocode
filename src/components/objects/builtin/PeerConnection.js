import Main from "../Main";

import "../Main.css";
import {KEY_TYPE, KEYS, NODES} from "../../../modules/model";

class PeerConnection extends Main {
  static item = "Peer Connection";
  static description = "Create a new peer connection";
  static icon = "portrait";
  static section = "builtin";
  static name = "PeerConnection";

  constructor(x, y) {
    super(x, y);
    this._inputs = 2;
    this._outputs = 1;
    this._acceptInputs = [NODES.TRACK];
    this._acceptOutputs = [NODES.WATCH];
    this._info = [
      { key: KEYS.NODE, value: NODES.PEER },
      {
        key: KEYS.INFO,
        value: "Create a new RTCPeerConnection instance for a user",
      },
    ];
    this._properties = [
      {
        prop: KEYS.NAME,
        label: "Name",
        type: KEY_TYPE.TEXT,
        value: `PC-${this._uuid}`,
        description: "Name of the Peer Connection",
      },
      {
        prop: KEYS.NETWORK,
        label: "Connection type",
        type: KEY_TYPE.ENUM,
        enum: [
          { label: "Any", value: "any" },
          { label: "Relay only", value: "relay" },
        ],
        value: "any",
        description: "Choose the connection type to use",
      },
    ];
  }

  renderProp(prop) {
    const property = this.getPropertyFor(prop);
    const label = this.getLabelFromPropertySelect(property);

    switch (prop) {
      case KEYS.NETWORK:
        return property.value === "any" ? "Unforced network" : label;
      case KEYS.NAME:
        return property.value;
      default:
        return "";
    }
  }

  render() {
    const item = `
      <div>
        <div class="title-box">
           <i class="fas fa-${this.constructor.icon}"></i> <span id="name-${
      this._uuid
    }">${this.renderProp(KEYS.NAME)}</span>
        </div>
        <div class="box">
            <i class="fas fa-chevron-right"></i> <span class="object-details-value" id="network-${
              this._uuid
            }">${this.renderProp(KEYS.NETWORK)}</span>
             <div class="object-footer">
                <span class="object-node object-title-box">${
                  this._info[0].value
                }.${this._uuid}</span>    
            </div>
        </div>
      </div>
      `;
    return item;
  }
}

export default PeerConnection;
