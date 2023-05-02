import Main from "../Main";
import { KEY_TYPE, KEYS, KIND, NODES } from "../../../modules/model";
import {
  findNodeByName,
  generateCustomId4,
  getNodeById,
  getNodesFromIds,
  getTransceiver,
  stringify,
} from "../../../modules/helper";

class AddTrack extends Main {
  static item = "Add a Track";
  static description = "Add a track during a call";
  static icon = "plus";
  static section = "actions";
  static name = "AddTrack";

  constructor(x, y) {
    super(x, y);
    this._inputs = 2;
    this._outputs = 1;
    this._info = [
      { key: KEYS.NODE, value: NODES.ADDTRACK },
      {
        key: KEYS.INFO,
        value:
          "Add a new track in a RTCPeerConnection. Equivalent to addTransceiver",
      },
    ];
    this._acceptInputs = [NODES.EVENTS, NODES.ACTIONS, NODES.TRACK];
    this._properties = [
      {
        prop: KEYS.NAME,
        label: "Name",
        type: KEY_TYPE.TEXT,
        value: `Add-${generateCustomId4()}`,
        description: "Name of the Adding",
        default: "Add",
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
        label: "Peer",
        type: KEY_TYPE.ENUM,
        enum: [{ label: "None", value: "none" }],
        value: "none",
        description: "Choose the RTCPeerConnection to call",
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
        return property.value === "none" ? "[no peer]" : `[${label}]`;
      default:
        return "";
    }
  }

  execute(nodes, frames, reporter, createMediaElementInIFrame) {
    return new Promise(async (resolve, _reject) => {
      // Get new track to add
      const inputNodes = getNodesFromIds(this.linksInput, nodes);
      const newTrackNode = findNodeByName(NODES.TRACK, inputNodes);
      const newFromProperty = newTrackNode.getPropertyFor(KEYS.FROM);
      const newTrackLabel =
        newTrackNode.getLabelFromPropertySelect(newFromProperty);
      const peerId = this.getPropertyValueFor(KEYS.PEER);

      const callId = this.getPropertyValueFor(KEYS.CALL);
      const callNode = getNodeById(callId, nodes);
      const calleeId = callNode.getPropertyValueFor(KEYS.RECIPIENT);
      let invertedCall = false;
      if (calleeId === peerId) {
        invertedCall = true;
      }

      // Deduce peer node from track node
      const win = frames[peerId];
      const pc = win.pc;
      if (pc) {
        try {
          const newStream = await newTrackNode.execute(win);
          const [track] = newStream.getTracks();

          win.pc.addEventListener(
            "negotiationneeded",
            async () => {
              await callNode.execute(
                nodes,
                frames,
                reporter,
                null,
                invertedCall,
                false
              );
              resolve();
            },
            { once: true }
          );

          pc.addTransceiver(track, {});

          // Create media element in IFrame
          createMediaElementInIFrame(
            win,
            newTrackNode.getInfoValueFor(KEYS.KIND),
            newTrackNode.id,
            true
          );

          win.document.querySelector(`#local-${newTrackNode.id}`).srcObject =
            newStream;

          // Send custom event
          reporter({
            win,
            name: "addTransceiver",
            category: "api",
            details: `add new track ${newTrackLabel}`,
            timestamp: Date.now(),
            ssrc: null,
            data: stringify(track),
            ended: null,
          });

          resolve();
        } catch (err) {
          console.warn("[addTrack] error", err);
          resolve();
        }
      }
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
                <span class="object-node object-title-box">${this.node}
                </span>    
            </div>
        </div>
      </div>
      `;
  }
}

export default AddTrack;
