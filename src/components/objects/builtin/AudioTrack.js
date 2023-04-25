import Main from "../Main";
import { KEY_TYPE, KEYS, KIND, NODES } from "../../../modules/model";
import { generateCustomId4 } from "../../../modules/helper";

class AudioTrack extends Main {
  static item = "Audio Track";
  static description = "Add an audio source from a fake device";
  static icon = "microphone";
  static section = "builtin";
  static name = "AudioTrack";

  constructor(x, y) {
    super(x, y);
    this._inputs = 0;
    this._outputs = 1;
    this._acceptInputs = [];
    this._acceptOutputs = [NODES.PEER, NODES.REPLACE];
    this._info = [
      { key: KEYS.NODE, value: NODES.TRACK },
      { key: KEYS.KIND, value: KIND.AUDIO },
      {
        key: KEYS.INFO,
        value: "Get the MediaStreamTrack instance from the fake device",
      },
    ];
    this._properties = [
      {
        prop: KEYS.NAME,
        label: "Name",
        type: KEY_TYPE.TEXT,
        value: `${KIND.AUDIO}-${generateCustomId4()}`,
        description: "Choose the preferred microphone",
        default: KIND.AUDIO,
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
        description: "Choose the preferred microphone",
      },
    ];
    this._sources = [];
  }

  // Don't use real devices
  // This function has been desactivated
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
        return property.value !== "none" ? `[${label}]` : label;
      default:
        return "";
    }
  }

  execute(win) {
    return new Promise((resolve, reject) => {
      const getAudioTrack = () => {
        const context = new win.AudioContext();
        const audio = new win.Audio("./outfoxing.mp3");
        const track = context.createMediaElementSource(audio);
        const gainNode = context.createGain();
        gainNode.gain.value = 0.2;
        const mediaStreamDestination = context.createMediaStreamDestination();
        track.connect(gainNode).connect(mediaStreamDestination);
        const mediaStream = mediaStreamDestination.stream;
        return mediaStream.getAudioTracks()[0];
      };

      try {
        const audioTrack = getAudioTrack();
        audioTrack.__wp = this.id;
        const stream = new win.MediaStream();
        stream.addTrack(audioTrack);
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

export default AudioTrack;
