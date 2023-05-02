import Main from "../Main";
import { KEY_TYPE, KEYS, KIND, NODES } from "../../../modules/model";
import {
  generateCustomId4,
  getNodeById,
  getTransceiver,
} from "../../../modules/helper";

class AudioEncodings extends Main {
  static item = "Set Audio Codec";
  static description = "Encode the track with a preferred codec";
  static icon = "shapes";
  static section = "actions";
  static name = "AudioEncodings";

  constructor(x, y) {
    super(x, y);
    this._inputs = 1;
    this._outputs = 1;
    this._info = [
      { key: KEYS.NODE, value: NODES.ENCODE },
      { key: KEYS.KIND, value: KIND.AUDIO },
      {
        key: KEYS.INFO,
        value:
          "Select the codec to use when encoding the track associated. Equivalent to setCodecPreferences",
      },
    ];
    this._acceptInputs = [NODES.PEER, NODES.EVENTS, NODES.ACTIONS];
    this._properties = [
      {
        prop: KEYS.NAME,
        label: "Name",
        type: KEY_TYPE.TEXT,
        value: `Encode-${generateCustomId4()}`,
        description: "Name of the Encodings",
        default: "Encode",
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
        prop: KEYS.PREFERENCE,
        label: "Codec Preferences",
        type: KEY_TYPE.ENUM,
        enum: [
          { label: "Unchanged", value: "unchanged" },
          { label: "Opus", value: "opus" },
          { label: "G711/PCMU", value: "pcmu" },
          { label: "G711/PCMA", value: "pcma" },
          { label: "G722", value: "g722" },
          { label: "Confort Noise", value: "cn" },
          { label: "Red", value: "red" },
        ],
        value: "unchanged",
        description: "Choose the preferred codec to use",
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
      case KEYS.PREFERENCE:
        return property.value === "unchanged" ? label : `use ${label}`;
      case KEYS.TRACK:
        return property.value === "none" ? "[no source]" : `[${label}]`;
      default:
        return "";
    }
  }

  execute(nodes, frames, reporter) {
    return new Promise((resolve, reject) => {
      const trackNodeId = this.getPropertyValueFor(KEYS.TRACK);
      const codecMimeType = this.getPropertyValueFor(KEYS.PREFERENCE);

      const trackNode = getNodeById(trackNodeId, nodes);
      const fromProperty = trackNode.getPropertyFor(KEYS.FROM);
      const trackLabel = trackNode.getLabelFromPropertySelect(fromProperty);

      // Deduce peer node from track node
      const peerId = trackNode.linksOutput[0];
      const peerNode = getNodeById(peerId, nodes);

      const win = frames[peerNode.id];
      if (!win.pc) {
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

      // Update codecs
      const { codecs } = RTCRtpSender.getCapabilities("audio");
      const preferredCodecs = codecs.filter((codec) =>
        codec.mimeType.toLowerCase().includes(codecMimeType.toLowerCase())
      );
      const firstCodecIndex = codecs.findIndex((codec) =>
        codec.mimeType.toLowerCase().includes(codecMimeType.toLowerCase())
      );

      codecs.splice(firstCodecIndex, preferredCodecs.length);
      codecs.unshift(...preferredCodecs);
      transceiver.setCodecPreferences(codecs);

      reporter({
        win,
        name: "setCodecPreferences",
        category: "api",
        timestamp: Date.now(),
        ssrc: null,
        details: `${this._uuid} encode track ${trackLabel} using ${codecMimeType}`,
        data: { codecs },
        ended: null,
      });
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
            <i id="track-color-${this._uuid}" class="fas fa-microphone ${
      this.renderColorIsMissingProp(KEYS.TRACK) ? "red" : ""
    }"></i><span class="object-details-value ${
      this.renderColorIsMissingProp(KEYS.TRACK) ? "red" : ""
    }" id="track-${this._uuid}">${this.renderProp(KEYS.TRACK)}</span>
            </div>
            <div class="object-box-line">
            <i class="fas fa-chevron-right"></i><span class="object-details-value" id="preference-${
              this._uuid
            }">${this.renderProp(KEYS.PREFERENCE)}</span>
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

export default AudioEncodings;
