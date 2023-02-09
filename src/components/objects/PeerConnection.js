import Main from "./Main";
import { nanoid } from "nanoid";

import "./Main.css";

class PeerConnection extends Main {
  static item = "Peer Connection";
  static description = "Create a new peer connection";
  static icon = "portrait";
  static section = "builtin";

  constructor(x, y) {
    super(x, y);
    this._inputs = 2;
    this._outputs = 3;
    this._acceptInputs = ["rtc.track"];
    this._acceptOutputs = ["rtc.encodings", "rtc.analysis"];
    this._info = [
      { key: "node", value: "rtc.peer" },
      {
        key: "info",
        value: "Create a new RTCPeerConnection instance for a user",
      },
    ];
    this._properties = [
      {
        prop: "name",
        label: "Name",
        type: "text",
        value: `PC-${nanoid(10)}`,
        description: "Name of the Peer Connection",
      },
      {
        prop: "network",
        label: "Connection type",
        type: "enum",
        enum: [
          { label: "Any", value: "any" },
          { label: "Relay only", value: "relay" },
        ],
        value: "any",
        description: "Choose the connection type to use",
      },
    ];
  }

  render() {
    const network = this.getPropertyFor("network");
    const label = this.getLabelFromPropertySelect(network);

    const item = `
      <div>
        <div class="title-box">
           <i class="fas fa-${this.constructor.icon}"></i> <span id="name-${this._uuid}">${this._properties[0].value}</span>
        </div>
        <div class="box">
            <i class="fas fa-chevron-right"></i> <span class="object-details-value" id="network-${this._uuid}">${label}</span>
             <div class="object-footer">
                <span class="object-node object-title-box">${this._info[0].value}</span>    
            </div>
        </div>
      </div>
      `;
    return item;
  }
}

export default PeerConnection;
