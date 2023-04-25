import Main from "../Main";
import { KEY_TYPE, KEYS, KIND, NODES } from "../../../modules/model";
import {
  findNodeByName,
  generateCustomId4,
  getNodeById,
  getNodesFromIds,
  getTransceiver,
} from "../../../modules/helper";
import { addCustomEvent } from "../../../modules/metrics";

class ReplaceTrack extends Main {
  static item = "Replace a Track";
  static description = "Replace an existing track by a new one";
  static icon = "exchange-alt";
  static section = "actions";
  static name = "ReplaceTrack";

  constructor(x, y) {
    super(x, y);
    this._inputs = 2;
    this._outputs = 1;
    this._info = [
      { key: KEYS.NODE, value: NODES.REPLACE },
      {
        key: KEYS.INFO,
        value:
          "Replace an existing track in a RTCPeerConnection. Equivalent to replaceTrack",
      },
    ];
    this._acceptInputs = [NODES.EVENTS, NODES.ACTIONS, NODES.TRACK];
    this._acceptOutputs = [NODES.ACTIONS];
    this._properties = [
      {
        prop: KEYS.NAME,
        label: "Name",
        type: KEY_TYPE.TEXT,
        value: `Replace-${generateCustomId4()}`,
        description: "Name of the Replacement",
        default: "Replace",
      },
      {
        prop: KEYS.PEER,
        label: "Peer",
        type: KEY_TYPE.ENUM,
        enum: [{ label: "None", value: "none" }],
        value: "none",
        description: "Choose the RTCPeerConnection to call",
      },
      {
        prop: KEYS.TRACK,
        label: "Replace Track",
        type: KEY_TYPE.ENUM,
        enum: [
          { label: "No source", value: "none" },
          { label: "Null", value: "null" },
        ],
        value: "none",
        description: "Choose the track to replace",
      },
    ];
    this._sources = [`${KEYS.NAME}:${KEYS.TRACK}@${NODES.TRACK}`];
  }

  renderProp(prop) {
    const property = this.getPropertyFor(prop);
    const label = this.getLabelFromPropertySelect(property);

    switch (prop) {
      case KEYS.NAME:
        return property.value;
      case KEYS.TRACK:
        return property.value === "none" ? "[no source]" : `[${label}]`;
      default:
        return "";
    }
  }

  execute(nodes, frames) {
    return new Promise(async (resolve, _reject) => {
      const trackNodeId = this.getPropertyValueFor(KEYS.TRACK);
      const trackNode = getNodeById(trackNodeId, nodes);
      const fromProperty = trackNode.getPropertyFor(KEYS.FROM);
      const trackLabel = trackNode.getLabelFromPropertySelect(fromProperty);

      // Get new track to replace
      const inputNodes = getNodesFromIds(this.linksInput, nodes);
      const newTrackNode = findNodeByName(NODES.TRACK, inputNodes);
      const newFromProperty = newTrackNode.getPropertyFor(KEYS.FROM);
      const newTrackLabel =
        newTrackNode.getLabelFromPropertySelect(newFromProperty);

      // Deduce peer node from track node
      let transceiver = null;
      let win = null;
      for (const peerId of Object.keys(frames)) {
        win = frames[peerId];
        const pc = win.pc;
        if (pc) {
          const transceivers = win.pc.getTransceivers();
          transceiver = getTransceiver(transceivers, trackNodeId);
          if (transceiver) {
            break;
          }
        }
      }
      if (!transceiver) {
        console.warn(
          `[replace] don't find transceiver for track ${trackNodeId}`
        );
        resolve();
        return;
      }

      // Execute new track
      const newStream = await newTrackNode.execute(win);
      const [track] = newStream.getTracks();
      const sender = transceiver.sender;
      if (sender && track) {
        try {
          // Replace the track
          await sender.replaceTrack(track);

          // Update the media element
          win.document.querySelector(`#local-${trackNodeId}`).srcObject =
            newStream;
          win.document.querySelector(
            `#local-${trackNodeId}`
          ).id = `local-${newTrackNode.id}`;

          // Send custom event
          addCustomEvent(
            win,
            "replace-track",
            "playground",
            `Replace track ${trackLabel} by track ${newTrackLabel}`,
            new Date()
          );
          resolve();
        } catch (err) {
          console.warn("[encode] error", err);
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
            <i id="track-color-${this._uuid}" class="fas fa-video ${
      this.renderColorIsMissingProp(KEYS.TRACK) ? "red" : ""
    }"></i><span class="object-details-value ${
      this.renderColorIsMissingProp(KEYS.TRACK) ? "red" : ""
    }" id="track-${this._uuid}">${this.renderProp(KEYS.TRACK)}</span>
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

export default ReplaceTrack;
