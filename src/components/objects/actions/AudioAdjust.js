import Main from "../Main";
import { KEY_TYPE, KEYS, KIND, NODES } from "../../../modules/model";
import { getNodeById, getTransceiver } from "../../../modules/helper";
import { addCustomEvent } from "../../../modules/metrics";

class AudioAdjust extends Main {
  static item = "Adjust Audio Parameters";
  static description = "Parameterize the audio track";
  static icon = "sliders-h";
  static section = "actions";
  static name = "AudioAdjust";

  constructor(x, y) {
    super(x, y);
    this._inputs = 1;
    this._outputs = 1;
    this._info = [
      { key: KEYS.NODE, value: NODES.ADJUST },
      { key: KEYS.KIND, value: KIND.AUDIO },
      {
        key: KEYS.INFO,
        value:
          "Parameterize the track. Equivalent to setParameters. Only work when in call",
      },
    ];
    this._acceptInputs = [NODES.EVENTS, NODES.ACTIONS];
    this._acceptOutputs = [NODES.ACTIONS];
    this._properties = [
      {
        prop: KEYS.NAME,
        label: "Name",
        type: KEY_TYPE.TEXT,
        value: "Adjust Audio",
        description: "Name of the adjustment",
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
        prop: KEYS.ACTIVE,
        label: "Active",
        type: "enum",
        enum: [
          { label: "Yes", value: "yes" },
          { label: "No", value: "no" },
        ],
        value: "yes",
        description: "Choose if the track is active",
      },
      {
        prop: KEYS.MAX_BITRATE,
        label: "Max Bitrate",
        type: KEY_TYPE.ENUM,
        enum: [
          { label: "No rate limit", value: -1 },
          { label: "512 Kbps", value: 5120000 },
          { label: "256 Kbps", value: 2560000 },
          { label: "128 Kbps", value: 1280000 },
          { label: "96 Kbps", value: 96000 },
          { label: "64 Kbps", value: 640000 },
          { label: "48 Kbps", value: 480000 },
          { label: "32 Kbps", value: 320000 },
          { label: "16 Kbps", value: 160000 },
        ],
        value: -1,
        description: "Choose the maximum bitrate to use",
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
      case KEYS.ACTIVE:
        return property.value === "yes" ? "Active" : "Inactive";
      case KEYS.MAX_BITRATE:
        return property.value === -1 ? label : `Max ${label}`;
      case KEYS.TRACK:
        return property.value === "none" ? "[no source]" : `[${label}]`;
    }
  }

  execute(nodes, frames) {
    return new Promise((resolve, reject) => {
      const trackNodeId = this.getPropertyValueFor(KEYS.TRACK);
      const maxBitrate = this.getPropertyValueFor(KEYS.MAX_BITRATE);
      const maxFramerate = this.getPropertyValueFor(KEYS.MAX_FRAMERATE);
      const active = this.getPropertyValueFor(KEYS.ACTIVE);

      const trackNode = getNodeById(trackNodeId, nodes);

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
      if (!sender) {
        resolve();
        return;
      }
      const parameters = sender.getParameters();

      const newParameters = { ...parameters };
      const encodings = newParameters.encodings[0];
      if (!encodings) {
        console.warn("[adjust] no encodings found");
        resolve();
        return;
      }

      let parameter = ``;
      encodings.active = active === "yes";
      parameter += `encoding=${active === "yes"}`;
      if (maxBitrate > -1) {
        encodings.maxBitrate = maxBitrate;
        parameter += `,maxbitrate=${maxBitrate}`;
      }
      if (maxFramerate > -1) {
        encodings.maxFramerate = maxFramerate;
        parameter += `,maxframerate=${maxFramerate}`;
      }

      sender
        .setParameters(newParameters)
        .then(() => {
          addCustomEvent(
            peerNode.id,
            frames,
            "set-parameters",
            "playground",
            `${this._uuid} parameterize track with ${parameter}`,
            new Date()
          );
          resolve();
        })
        .catch((err) => {
          console.warn("[encode] error", err);
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
    }">${this.renderProp(KEYS.NAME)}</span>
        </div>
         <div class="box">
            <div class="object-box-line">
           <i id="track-color-${this._uuid}" class="fas fa-microphone ${
      this.renderColorIsMissingProp(KEYS.TRACK) ? "red" : ""
    }"></i><span class="object-details-value ${
      this.renderColorIsMissingProp(KEYS.TRACK) ? "red" : ""
    }" id="track-${this._uuid}">${this.renderProp(KEYS.TRACK)}</span>
            </div>
            <div class="object-box-line">
            <i class="fas fa-chevron-right"></i><span class="object-details-value" id="active-${
              this._uuid
            }">${this.renderProp(KEYS.ACTIVE)}</span>
            </div>
            <div class="object-box-line">
            <i class="fas fa-chevron-right"></i><span class="object-details-value" id="maxBitrate-${
              this._uuid
            }">${this.renderProp(KEYS.MAX_BITRATE)}</span>
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

export default AudioAdjust;
