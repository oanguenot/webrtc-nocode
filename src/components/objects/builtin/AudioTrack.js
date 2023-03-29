import Main from "../Main";
import { KEY_TYPE, KEYS, KIND, NODES } from "../../../modules/model";
import { customAlphabet } from "nanoid";

const CUSTOM_ALPHABET = "0123456789abcdef";
const nanoid = customAlphabet(CUSTOM_ALPHABET, 4);

class AudioTrack extends Main {
  static item = "Audio Track";
  static description = "Add an audio source from a microphone";
  static icon = "microphone";
  static section = "builtin";
  static name = "AudioTrack";

  constructor(x, y) {
    super(x, y);
    this._inputs = 0;
    this._outputs = 1;
    this._acceptInputs = [];
    this._acceptOutputs = [NODES.PEER];
    this._info = [
      { key: KEYS.NODE, value: NODES.TRACK },
      { key: KEYS.KIND, value: KIND.AUDIO },
      {
        key: KEYS.INFO,
        value: "Get the MediaStreamTrack instance from the selected device",
      },
    ];
    this._properties = [
      {
        prop: KEYS.NAME,
        label: "Name",
        type: KEY_TYPE.TEXT,
        value: `${KIND.AUDIO}-${nanoid()}`,
        description: "Choose the preferred microphone",
      },
      {
        prop: KEYS.FROM,
        label: "From",
        type: KEY_TYPE.ENUM,
        enum: [
          { label: "[Default]", value: "[default]" },
          { label: "None", value: "none" },
          { label: "Fake", value: "fake" },
        ],
        value: "[default]",
        description: "Choose the preferred microphone",
      },
      {
        prop: KEYS.CHANNEL_COUNT,
        label: "Channels Count",
        type: KEY_TYPE.ENUM,
        enum: [
          { label: "Mono", value: 1 },
          { label: "Stereo", value: 2 },
        ],
        value: 1,
        description: "Number of Channels (mono or stereo)",
      },
    ];
    this._sources = [];
    this._targets = [
      `${KEYS.NAME}:${KEYS.TRACK}@${NODES.ENCODE}`,
      `${KEYS.NAME}:${KEYS.TRACK}@${NODES.ADJUST}`,
    ];
  }

  addDevices(list) {
    const prop = this._properties.find(
      (property) => property.prop === KEYS.FROM
    );
    const existingDevices = prop.enum;
    list.forEach((mediaDevice) => {
      if (mediaDevice.kind === "audioinput") {
        const found = existingDevices.find((device) =>
          [mediaDevice.label].includes(device.label)
        );
        if (!found) {
          existingDevices.push({
            label: mediaDevice.label,
            value: mediaDevice.deviceId,
          });
        }
      }
    });
  }

  renderProp(prop) {
    const property = this.getPropertyFor(prop);
    const label = this.getLabelFromPropertySelect(property);

    switch (prop) {
      case KEYS.NAME:
        return property.value;
      case KEYS.FROM:
        return label;
      case KEYS.CHANNEL_COUNT:
        return `${label}`;
      default:
        return "";
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
                <i class="fas fa-play"></i><span class="object-details-value" id="from-${
                  this._uuid
                }">${this.renderProp(KEYS.FROM)}</span>
            </div>
            <div class="object-box-line">
                <i class="fas fa-headphones"></i><span class="object-details-value" id="channelCount-${
                  this._uuid
                }">${this.renderProp(KEYS.CHANNEL_COUNT)}</span>
            </div>
            
            <div class="object-footer">
                <span class="object-node object-title-box">${
                  this._info[0].value
                }.${this._uuid}</span>    
            </div>
        </div>
        </div>
    `;
  }
}

export default AudioTrack;
