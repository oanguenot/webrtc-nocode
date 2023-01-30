import Main from "./Main";
import { nanoid } from "nanoid";

import "./Main.css";

class PeerConnection extends Main {
  static description = "Add Peer Connection";
  static icon = "portrait";

  constructor(x, y) {
    super(x, y);
    this._inputs = 1;
    this._outputs = 1;
    this._accept = ["start", "step"];
    this._info = [{ key: "node", value: "peerconnection" }];
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
            <i class="fas fa-chevron-right"></i> <span class="object-details-value">${label}</span>
             <div class="object-footer">
                <span class="object-node object-title-box">Peer Connection</span>    
            </div>
        </div>
      </div>
      `;
    return item;
  }
}

export default PeerConnection;
