import Main from "../Main";
import { KEY_TYPE, KEYS, NODES } from "../../../modules/model";
import { generateCustomId4, getNodeById } from "../../../modules/helper";

class WatchRTCNailupCall extends Main {
  static item = "WatchRTCNailupCall";
  static description = "Allow to start/stop nailup calls";
  static icon = "stopwatch";
  static section = "actions";
  static name = "WatchRTCNailupCall";

  constructor(x, y) {
    super(x, y);
    this._inputs = 1;
    this._outputs = 1;
    this._acceptInputs = [NODES.EVENTS, NODES.ACTIONS];
    this._info = [
      { key: KEYS.NODE, value: "action.nailup" },
      {
        key: KEYS.INFO,
        value: "Wait a moment before executing the next node",
      },
    ];
    this._properties = [
      {
        prop: KEYS.NAME,
        label: "Name",
        type: KEY_TYPE.TEXT,
        value: `Nailup-${generateCustomId4()}`,
        description: "Name of the Nailup Call",
        default: "Nailup",
      },
      {
        prop: KEYS.PEER,
        label: "From",
        type: KEY_TYPE.ENUM,
        enum: [{ label: "None", value: "none" }],
        value: "none",
        description: "Choose the Peer to update",
      },
      {
        prop: KEYS.NAILUP_OPERATION,
        label: "Operation",
        type: KEY_TYPE.ENUM,
        enum: [
          { label: "None", value: "none" },
          { label: "Persistent Start", value: "start" },
          { label: "Persistent Stop", value: "stop" },
        ],
        value: "none",
        description: "Choose the persistent operation",
      },
      {
        prop: "roomId",
        label: "Room ID",
        type: "text",
        value: "",
        description: "Name of the room",
        default: "",
      },
    ];
    this._sources = [`${KEYS.NAME}:${KEYS.PEER}@${NODES.PEER}`];
  }

  renderProp(prop) {
    const property = this.getPropertyFor(prop);
    const label = this.getLabelFromPropertySelect(property);

    switch (prop) {
      case KEYS.NAME:
        return property.value;
      case KEYS.PEER:
        return property.value === "none" ? "no peer" : `[${label}]`;
      case KEYS.NAILUP_OPERATION:
        return `${label}`;
      case "roomId":
        return property.value ? property.value : "no ID for room";
      default:
        return "";
    }
  }

  execute(nodes, frames, reporter) {
    return new Promise((resolve, _reject) => {
      // get peerId
      const peerId = this.getPropertyValueFor(KEYS.PEER);
      // get the peer node --> rtcPeerId
      const peerNode = getNodeById(peerId, nodes);
      const rtcPeerId = peerNode.getPropertyValueFor("name");
      // get the operation "start" or "end"
      const operation = this.getPropertyValueFor(KEYS.NAILUP_OPERATION);

      // get the new roomId for persistent start
      const rtcRoomId = this.getPropertyValueFor("roomId");

      const win = frames[peerId];

      if (win.watchRTC) {
        if (operation === "start") {
          win.watchRTC.persistentStart(rtcRoomId, rtcPeerId);
        } else if (operation === "stop") {
          win.watchRTC.persistentEnd();
        }
      }
      resolve();
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
            <i id="peer-color-${this._uuid}" class="fas fa-portrait ${
              this.renderColorIsMissingProp(KEYS.PEER) ? "red" : ""
            }"></i><span class="object-details-value ${
              this.renderColorIsMissingProp(KEYS.PEER) ? "red" : ""
            }" id="peer-${this._uuid}">${this.renderProp(KEYS.PEER)}</span>
            </div>
             <div class="object-box-line">
              <i class="fas fa-hourglass-half"></i><span class="object-details-value" id="nailup_operation-${
                this._uuid
              }">${this.renderProp(KEYS.NAILUP_OPERATION)}</span>
            </div>
            <div class="object-box-line">
            <i class="fas fa-house-user"></i><span class="object-details-value" id="roomId-${
              this._uuid
            }">${this.renderProp("roomId")}</span>
            </div>
            <div class="object-footer">
                <span class="object-node object-title-box">${this.node}
                </span>      
            </div>
        </div>
      </div>
    `;
  }
}

export default WatchRTCNailupCall;
