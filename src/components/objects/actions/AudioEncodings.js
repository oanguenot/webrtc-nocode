import Main from "../Main";
import { KEY_TYPE, KEYS, KIND, NODES } from "../../../modules/model";

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
    this._acceptOutputs = [NODES.ACTIONS];
    this._properties = [
      {
        prop: KEYS.NAME,
        label: "Name",
        type: KEY_TYPE.TEXT,
        value: "Set Audio Codec",
        description: "Name of the Encodings",
      },
      {
        prop: KEYS.PREFERENCE,
        label: "Codec Preferences",
        type: KEY_TYPE.ENUM,
        enum: [
          { label: "Unchanged", value: "unchanged" },
          { label: "Opus", value: "opus" },
          { label: "G711", value: "g711" },
        ],
        value: "unchanged",
        description: "Choose the preferred codec to use",
      },
      {
        prop: KEYS.TRACK,
        label: "Track",
        type: KEY_TYPE.ENUM,
        enum: [{ label: "None", value: "none" }],
        value: "none",
        description: "Choose the track to update",
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
      case KEYS.PREFERENCE:
        return property.value === "unchanged" ? label : `use ${label}`;
      case KEYS.TRACK:
        return property.value === "none" ? "no track" : `${label}`;
    }
  }

  renderColorIsMissingProp(prop) {
    const property = this.getPropertyFor(prop);
    return property && property.value === "none";
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
                <span class="object-node object-title-box">${
                  this._info[0].value
                }.${this._uuid}
                </span>    
            </div>
        </div>
      </div>
      `;
  }
}

export default AudioEncodings;
