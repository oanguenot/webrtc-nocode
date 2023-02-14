import Main from "../Main";
import {KEY_TYPE, KEYS, KIND, NODES} from "../../../modules/model";

class AudioEncodings extends Main {
  static item = "Audio Encodings";
  static description = "Select the encodings parameters";
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
          "Change the track's encoding associated to the RTCRtpSender. Equivalent to setParameters",
      },
    ];
    this._acceptInputs = [NODES.PEER, NODES.EVENTS, NODES.ACTIONS];
    this._acceptOutputs = [NODES.ACTIONS];
    this._properties = [
      {
        prop: KEYS.NAME,
        label: "Name",
        type: KEY_TYPE.TEXT,
        value: "Audio Encode",
        description: "Name of the Encodings",
      },
      {
        prop: KEYS.PREFERENCE,
        label: "Codec Preferences",
        type: KEY_TYPE.ENUM,
        enum: [
          { label: "Opus", value: "opus" },
          { label: "G711", value: "g711" },
        ],
        value: "opus",
        description: "Choose the preferred codec to use",
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
        description: "Choose if the stream is active",
      },
      {
        prop: KEYS.MAX_BITRATE,
        label: "Max Bitrate",
        type: KEY_TYPE.ENUM,
        enum: [
          { label: "Unlimited", value: "unlimited" },
          { label: "512 Kbps", value: 5120000 },
          { label: "256 Kbps", value: 2560000 },
          { label: "128 Kbps", value: 1280000 },
          { label: "96 Kbps", value: 96000 },
          { label: "64 Kbps", value: 640000 },
          { label: "48 Kbps", value: 480000 },
          { label: "32 Kbps", value: 320000 },
          { label: "16 Kbps", value: 160000 },
        ],
        value: "unlimited",
        description: "Choose the maximum bitrate to use",
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
  }

  renderProp(prop) {
    const property = this.getPropertyFor(prop);
    const label = this.getLabelFromPropertySelect(property);

    switch (prop) {
      case KEYS.NAME:
        return property.value;
      case KEYS.PREFERENCE:
        return `use ${label}`;
      case KEYS.ACTIVE:
        return property.value === "yes" ? "active" : "inactive";
      case KEYS.MAX_BITRATE:
        return property.value === "unlimited"
          ? "no rate limit"
          : `limited to ${label}`;
      case KEYS.TRACK:
        return property.value === "none" ? "no track" : `encode ${label}`;
    }
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
            <i class="fas fa-chevron-right"></i><span class="object-details-value" id="track-${
              this._uuid
            }">${this.renderProp(KEYS.TRACK)}</span>
            </div>
            <div class="object-box-line">
            <i class="fas fa-chevron-right"></i><span class="object-details-value" id="preference-${
              this._uuid
            }">${this.renderProp(KEYS.PREFERENCE)}</span>
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
