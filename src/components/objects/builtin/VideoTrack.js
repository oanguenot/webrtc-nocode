import Main from "../Main";
import { customAlphabet } from "nanoid";
import { KEY_TYPE, KEYS, KIND, NODES } from "../../../modules/model";

const CUSTOM_ALPHABET = "0123456789abcdef";
const nanoid = customAlphabet(CUSTOM_ALPHABET, 4);

class VideoTrack extends Main {
  static item = "Video Track";
  static description = "Add a video source from a fake device";
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
          { label: "None", value: "none" },
          { label: "Fake", value: "[fake]" },
        ],
        value: "[fake]",
        description: "Choose the preferred camera",
      },
    ];
    this._sources = [];
  }

  // Don't use real devices
  // This function has been desactivated
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
        return property.value !== "none" ? `[${label}]` : label;
      default:
        return "";
    }
  }

  execute(win) {
    return new Promise((resolve, reject) => {
      const getVideoTrack = (width, height, r, g, b) => {
        const canvas = Object.assign(win.document.createElement("canvas"), {
          width,
          height,
        });

        const ctx = canvas.getContext("2d");
        ctx.fillRect(0, 0, width, height);
        const p = ctx.getImageData(0, 0, width, height);
        const draw = () => {
          for (let i = 0; i < p.data.length; i++) {
            const color = Math.random() * 255;
            p.data[i++] = color * r;
            p.data[i++] = color * g;
            p.data[i++] = color * b;
          }
          ctx.putImageData(p, 0, 0);
          requestAnimationFrame(draw);
        };
        requestAnimationFrame(draw);
        const videoStream = canvas.captureStream();
        return videoStream.getVideoTracks()[0];
      };

      try {
        const videoTrack = getVideoTrack(96, 64, 0, 1, 0);
        const stream = new win.MediaStream();
        stream.addTrack(videoTrack);
        resolve(stream);
      } catch (err) {
        console.log(`[IFRAME] :: error got stream ${err.toString()}`);
        reject(null);
      }
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
                <i class="fas fa-play"></i><span class="object-details-value" id="from-${
                  this._uuid
                }">${this.renderProp(KEYS.FROM)}</span>
            </div>
            <div class="object-footer">
                <span class="object-node object-title-box">${
                  this.node
                }</span>    
            </div>
        </div>
      </div>
      `;
  }
}

export default VideoTrack;
