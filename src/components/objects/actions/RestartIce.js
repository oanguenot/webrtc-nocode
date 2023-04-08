import Main from "../Main";
import { KEY_TYPE, KEYS, NODES } from "../../../modules/model";
import { getNodeById } from "../../../modules/helper";
import { addCustomEvent } from "../../../modules/metrics";

class RestartIce extends Main {
  static item = "RestartIce";
  static description = "Restart ICE";
  static icon = "recycle";
  static section = "actions";
  static name = "RestartIce";

  constructor(x, y) {
    super(x, y);
    this._inputs = 1;
    this._outputs = 1;
    this._info = [
      { key: KEYS.NODE, value: NODES.RESTARTICE },
      {
        key: KEYS.INFO,
        value: "Restart ICE",
      },
    ];
    this._acceptInputs = [NODES.EVENTS, NODES.ACTIONS];
    this._acceptOutputs = [NODES.ACTIONS];
    this._properties = [
      {
        prop: KEYS.NAME,
        label: "Name",
        type: KEY_TYPE.TEXT,
        value: "Restart ICE",
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
      {
        prop: KEYS.PEER,
        label: "From",
        type: KEY_TYPE.ENUM,
        enum: [{ label: "None", value: "none" }],
        value: "none",
        description: "Choose the Peer to update",
      },
    ];
    this._sources = [
      `${KEYS.NAME}:${KEYS.CALL}@${NODES.CALL}`,
      `${KEYS.NAME}:${KEYS.PEER}@${NODES.PEER}`,
    ];
  }

  renderProp(prop) {
    const property = this.getPropertyFor(prop);
    const label = this.getLabelFromPropertySelect(property);

    switch (prop) {
      case KEYS.NAME:
        return property.value;
      case KEYS.CALL:
        return property.value === "none" ? "no call" : `[${label}]`;
      case KEYS.PEER:
        return property.value === "none" ? "no peer" : `[${label}]`;
      default:
        return "";
    }
  }

  execute(nodes, frames, callback) {
    return new Promise((resolve, reject) => {
      const peerId = this.getPropertyValueFor(KEYS.PEER);
      const peerNode = getNodeById(peerId, nodes);

      const win = frames[peerId];
      if (!win.pc) {
        console.log("Can't restartIce - no peer connection");
        resolve();
        return;
      }

      const callId = this.getPropertyValueFor(KEYS.CALL);
      const callNode = getNodeById(callId, nodes);
      const calleeId = callNode.getPropertyValueFor(KEYS.RECIPIENT);
      const calleeNode = getNodeById(calleeId, nodes);

      win.pc.addEventListener(
        "negotiationneeded",
        async () => {
          await callback(peerNode, calleeNode, callNode, nodes);
          resolve();
        },
        { once: true }
      );

      // Restart ICE
      win.pc.restartIce();
      addCustomEvent(
        peerNode.id,
        frames,
        "restart-ice",
        "playground",
        "",
        new Date()
      );
    });
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
            <div class="object-box-line">
            <i id="peer-color-${this._uuid}" class="fas fa-portrait ${
      this.renderColorIsMissingProp(KEYS.PEER) ? "red" : ""
    }"></i><span class="object-details-value ${
      this.renderColorIsMissingProp(KEYS.PEER) ? "red" : ""
    }" id="peer-${this._uuid}">${this.renderProp(KEYS.PEER)}</span>
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

export default RestartIce;
