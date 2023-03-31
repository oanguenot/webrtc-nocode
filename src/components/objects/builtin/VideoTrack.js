import Main from "../Main";
import { customAlphabet } from "nanoid";
import { KEY_TYPE, KEYS, KIND, NODES } from "../../../modules/model";

const CUSTOM_ALPHABET = "0123456789abcdef";
const nanoid = customAlphabet(CUSTOM_ALPHABET, 4);

class VideoTrack extends Main {
  static item = "Video Track";
  static description = "Add a video source from a webcam";
  static icon = "video";
  static section = "builtin";
  static name = "VideoTrack";

  constructor(x, y) {
    super(x, y);
    this._inputs = 0;
    this._outputs = 1;
    this._acceptInputs = [];
    this._acceptOutputs = [NODES.PEER];
    this._info = [
      { key: KEYS.NODE, value: NODES.TRACK },
      { key: KEYS.KIND, value: KIND.VIDEO },
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
        value: `${KIND.VIDEO}-${nanoid()}`,
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
        description: "Choose the preferred camera",
      },
      {
        prop: KEYS.FRAMERATE,
        label: "Framerate",
        type: KEY_TYPE.ENUM,
        enum: [
          { label: "1 fps", value: 1 },
          { label: "6 fps", value: 5 },
          { label: "12 fps", value: 12 },
          { label: "24 fps", value: 24 },
          { label: "30 fps", value: 30 },
          { label: "60 fps", value: 60 },
        ],
        value: 30,
        description: "Number of frames per second",
      },
      {
        prop: KEYS.RESOLUTION,
        label: "Resolution",
        type: KEY_TYPE.ENUM,
        enum: [
          { label: "480p", value: "480p" },
          { label: "HD", value: "720p" },
          { label: "Full HD", value: "1080p" },
          { label: "4K", value: "4k" },
        ],
        value: "720p",
        description: "Choose a resolution",
      },
    ];
    this._sources = [];
    this._targets = [
      `${KEYS.NAME}:${KEYS.TRACK}@${NODES.ENCODE}`,
      `${KEYS.NAME}:${KEYS.TRACK}@${NODES.ADJUST}`,
    ];
  }

  addDevices(list) {
    const prop = this._properties.find((property) => property.prop === "from");
    const existingDevices = prop.enum;
    list.forEach((mediaDevice) => {
      if (mediaDevice.kind === "videoinput") {
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
      case KEYS.FRAMERATE:
        return `${label}`;
      case KEYS.RESOLUTION:
        return `${label}`;
      default:
        return "";
    }
  }

  render() {
    return `
     <div>
        <div class="title-box">
           <i class="fas fa-${this.constructor.icon}"></i> <span id="from-${
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
            <i class="fas fa-ruler-combined"></i><span class="object-details-value" id="resolution-${
              this._uuid
            }">${this.renderProp(KEYS.RESOLUTION)}</span>
          </div>
          <div class="object-box-line">
            <i class="fas fa-tachometer-alt"></i><span class="object-details-value" id="framerate-${
              this._uuid
            }">${this.renderProp(KEYS.FRAMERATE)}</span>
          </div>
          <div class="object-footer">
            <span class="object-node object-title-box">${this.node}</span>    
          </div>
        </div>
      </div>
      `;
  }
}

export default VideoTrack;
