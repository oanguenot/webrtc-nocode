import Main from "../Main";
import { KEY_TYPE, KEYS, KIND, NODES } from "../../../modules/model";
import { customAlphabet } from "nanoid";

const CUSTOM_ALPHABET = "0123456789abcdef";
const nanoid = customAlphabet(CUSTOM_ALPHABET, 4);

class AudioMute extends Main {
  static item = "Mute Audio Track";
  static description = "Mute an audio track";
  static icon = "microphone-alt-slash";
  static section = "actions";
  static name = "AudioMute";

  constructor(x, y) {
    super(x, y);
    this._inputs = 1;
    this._outputs = 1;
    this._info = [
      { key: KEYS.NODE, value: NODES.MUTE },
      { key: KEYS.KIND, value: KIND.AUDIO },
      {
        key: KEYS.INFO,
        value: "Mute the track using different ways",
      },
    ];
    this._acceptInputs = [NODES.EVENTS, NODES.ACTIONS];
    this._acceptOutputs = [NODES.ACTIONS];
    this._properties = [
      {
        prop: KEYS.NAME,
        label: "Name",
        type: KEY_TYPE.TEXT,
        value: `Mute-${nanoid()}`,
        description: "Name of the Mute",
      },
      {
        prop: KEYS.TRACK,
        label: "Track",
        type: KEY_TYPE.ENUM,
        enum: [{ label: "No source", value: "none" }],
        value: "none",
        description: "Choose the track to mute",
      },
      {
        prop: KEYS.METHOD,
        label: "Method",
        type: KEY_TYPE.ENUM,
        enum: [
          { label: "Using track", value: "enabled" },
          { label: "Using recvonly", value: "direction" },
          { label: "Using encodings", value: "active" },
          { label: "Mix of properties", value: "mix" },
        ],
        value: "enabled",
        description: "Choose if the stream is active",
      },
    ];
    this._sources = [`${KEYS.NAME}:${KEYS.TRACK}@${NODES.TRACK}`];
    this._targets = [];
  }

  renderProp(prop) {
    const property = this.getPropertyFor(prop);
    const label = this.getLabelFromPropertySelect(property);

    switch (prop) {
      case KEYS.NAME:
        return property.value;
      case KEYS.METHOD:
        return label;
      case KEYS.TRACK:
        return property.value === "none" ? "[no source]" : `[${label}]`;
    }
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
            <i id="track-color-${this._uuid}" class="fas fa-microphone ${
      this.renderColorIsMissingProp(KEYS.TRACK) ? "red" : ""
    }"></i><span class="object-details-value ${
      this.renderColorIsMissingProp(KEYS.TRACK) ? "red" : ""
    }" id="track-${this._uuid}">${this.renderProp(KEYS.TRACK)}</span>
            </div>
            <div class="object-box-line">
            <i class="fas fa-chevron-right"></i><span class="object-details-value" id="method-${
              this._uuid
            }">${this.renderProp(KEYS.METHOD)}</span>
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

export default AudioMute;
