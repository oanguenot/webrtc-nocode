import Main from "../Main";
import { KEY_TYPE, KEYS, KIND, NODES } from "../../../modules/model";
import {
  displayNbPropsFromValue,
  generateCustomId4,
  getNodeById,
  getTransceiver,
} from "../../../modules/helper";

class VideoConstraints extends Main {
  static item = "Adjust Video constraints";
  static description = "Change the device video constraints";
  static icon = "compress";
  static section = "actions";
  static name = "VideoConstraints";

  constructor(x, y) {
    super(x, y);
    this._inputs = 1;
    this._outputs = 1;
    this._info = [
      { key: KEYS.NODE, value: NODES.CONSTRAINTS },
      { key: KEYS.KIND, value: KIND.VIDEO },
      {
        key: KEYS.INFO,
        value:
          "Change the video constraints for the track. Equivalent to applyConstraints",
      },
    ];
    this._acceptInputs = [NODES.EVENTS, NODES.ACTIONS];
    this._acceptOutputs = [NODES.ACTIONS];
    this._properties = [
      {
        prop: KEYS.NAME,
        label: "Name",
        type: KEY_TYPE.TEXT,
        value: `Constraints-${generateCustomId4()}`,
        description: "Name of the adjustment",
        default: "Constraints",
      },
      {
        prop: KEYS.TRACK,
        label: "Track",
        type: KEY_TYPE.ENUM,
        enum: [{ label: "No source", value: "none" }],
        value: "none",
        description: "Choose the track to update",
      },
      {
        prop: KEYS.CONSTRAINTS,
        label: "Constraints",
        type: KEY_TYPE.TEXTAREA,
        value: "",
        description: "List the constraints to apply",
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
      case KEYS.CONSTRAINTS:
        return displayNbPropsFromValue(property.value);
      case KEYS.TRACK:
        return property.value === "none" ? "[no source]" : `[${label}]`;
      default:
        return "";
    }
  }

  execute(nodes, frames, reporter) {
    return new Promise((resolve, reject) => {
      const trackNodeId = this.getPropertyValueFor(KEYS.TRACK);
      const listOfConstraints = this.getPropertyValueFor(
        KEYS.CONSTRAINTS
      ).split("\n");

      const constraints = {};

      listOfConstraints.forEach((contraintString) => {
        const properties = contraintString.split("=")[0];
        const value = contraintString.split("=")[1];
        const property = properties.split(".")[0];
        const operator = properties.split(".")[1];
        if (property && value) {
          if (operator) {
            constraints[property] = {};
            constraints[property][operator] = value;
          } else {
            constraints[property] = value;
          }
        }
      });

      const trackNode = getNodeById(trackNodeId, nodes);
      const fromProperty = trackNode.getPropertyFor(KEYS.FROM);
      const trackLabel = trackNode.getLabelFromPropertySelect(fromProperty);

      // Deduce peer node from track node
      const peerId = trackNode.linksOutput[0];
      const peerNode = getNodeById(peerId, nodes);

      const win = frames[peerNode.id];
      if (!win.pc) {
        console.log("Can't adjust - no peer connection");
        resolve();
        return;
      }

      // Get transceiver and sender used
      const transceivers = win.pc.getTransceivers();
      const transceiver = getTransceiver(transceivers, trackNodeId);
      if (!transceiver) {
        resolve();
        return;
      }

      // Change active flags
      const sender = transceiver.sender;
      const track = sender.track;
      if (!sender || !sender.track) {
        resolve();
        return;
      }

      track
        .applyConstraints(constraints)
        .then(() => {
          reporter({
            win,
            name: "applyConstraints",
            category: "api",
            details: `Change constraints for ${trackLabel} with ${constraints}`,
            ssrc: null,
            data: constraints,
            timestamp: Date.now(),
            ended: null,
          });
          resolve();
        })
        .catch((err) => {
          console.warn("[constraints] error", err);
          resolve();
        });
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
            <div class="object-box-line">
            <i class="fas fa-chevron-right"></i><span class="object-details-value" id="constraints-${
              this._uuid
            }">${this.renderProp(KEYS.CONSTRAINTS)}</span>
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

export default VideoConstraints;
