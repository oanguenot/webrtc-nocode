import Main from "../Main";
import { KEY_TYPE, KEYS, KIND, NODES } from "../../../modules/model";
import {
  findNodeByName,
  generateCustomId4, getFirstEmptyTransceiver,
  getNodeById,
  getNodesFromIds,
  getTransceiver,
} from "../../../modules/helper";

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
        ],
        value: "none",
        description: "Choose the track to replace",
      },
    ];
    this._sources = [
      `${KEYS.NAME}:${KEYS.TRACK}@${NODES.TRACK}`,
      `${KEYS.NAME}:${KEYS.PEER}@${NODES.PEER}`,
    ];
  }

  renderProp(prop) {
    const property = this.getPropertyFor(prop);
    const label = this.getLabelFromPropertySelect(property);

    switch (prop) {
      case KEYS.NAME:
        return property.value;
      case KEYS.TRACK:
        return property.value === "none" ? "[no source]" : `[${label}]`;
      case KEYS.PEER:
        return property.value === "none" ? "[no peer]" : `[${label}]`;
      default:
        return "";
    }
  }

  execute(nodes, frames, reporter) {
    return new Promise(async (resolve, _reject) => {
      const trackNodeId = this.getPropertyValueFor(KEYS.TRACK);
      const trackNode = getNodeById(trackNodeId, nodes);
      const fromProperty = trackNode.getPropertyFor(KEYS.FROM);
      const trackLabel = trackNode.getLabelFromPropertySelect(fromProperty);

      // Get new track to replace
      const inputNodes = getNodesFromIds(this.linksInput, nodes);
      const newTrackNode = findNodeByName(NODES.TRACK, inputNodes);
      let newTrackLabel = "null";
      if(newTrackNode) {
        const newFromProperty = newTrackNode.getPropertyFor(KEYS.FROM);
        newTrackLabel =
          newTrackNode.getLabelFromPropertySelect(newFromProperty);
      }
      const peerId = this.getPropertyValueFor(KEYS.PEER);

      // Deduce peer node from track node
      let transceiver = null;
      const win = frames[peerId];
      const pc = win.pc;
      if (pc) {
        const transceivers = win.pc.getTransceivers();
        transceiver = getTransceiver(transceivers, trackNodeId);
        if(!transceiver) {
          transceiver = getFirstEmptyTransceiver(transceivers);
        }
      }
      if (!transceiver) {
        console.warn(
          `[replace] don't find transceiver for track ${trackNodeId}`
        );
        resolve();
        return;
      } else if (!transceiver.sender.track) {
        console.warn(
          `[replace] find an empty transceiver for track ${trackNodeId}`
        );
      }

      // Execute new track
      let newStream = null, track= null;
      if(newTrackNode) {
        newStream = await newTrackNode.execute(win);
        [track] = newStream.getTracks();
      }

      const sender = transceiver.sender;

      try {
        // Replace the track
        await sender.replaceTrack(track);

        // Update the media element
        win.document.querySelector(`#local-${trackNodeId}`).srcObject =
          newStream;
        win.document.querySelector(
          `#local-${trackNodeId}`
        ).id = `local-${newTrackNode ? newTrackNode.id : "null"}`;

        // Send custom event
        reporter({
          win,
          name: "replaceTrack",
          category: "api",
          details: `Replace track ${trackLabel} by track ${newTrackLabel}`,
          timestamp: Date.now(),
          ssrc: null,
          data: null,
          ended: null,
        });

        resolve();
      } catch (err) {
        console.warn("[encode] error", err);
        resolve();
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
            <i id="peer-color-${this._uuid}" class="fas fa-portrait ${
      this.renderColorIsMissingProp(KEYS.PEER) ? "red" : ""
    }"></i><span class="object-details-value ${
      this.renderColorIsMissingProp(KEYS.PEER) ? "red" : ""
    }" id="peer-${this._uuid}">${this.renderProp(KEYS.PEER)}</span>
            </div>
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
