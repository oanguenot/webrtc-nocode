import Main from "./Main";

class AudioTrack extends Main {
  static item = "Audio Track";
  static description = "Add an audio source from a microphone";
  static icon = "microphone";
  static section = "builtin";

  constructor(x, y) {
    super(x, y);
    this._inputs = 1;
    this._outputs = 1;
    this._acceptInputs = ["*"];
    this._info = [
      { key: "node", value: "track" },
      { key: "kind", value: "audio" },
    ];
    this._properties = [
      {
        prop: "from",
        label: "From",
        type: "enum",
        enum: [{ label: "Fake", value: "fake" }],
        value: "fake",
        description: "Choose the preferred microphone",
      },
      {
        prop: "channelCount",
        label: "Channels Count",
        type: "enum",
        enum: [
          { label: "Mono", value: 1 },
          { label: "Stereo", value: 2 },
        ],
        value: 1,
        description: "Number of Channels (mono or stereo)",
      },
    ];
  }

  addDevices(list) {
    const prop = this._properties.find((property) => property.prop === "from");
    const existingDevices = prop.enum;
    list.forEach((mediaDevice) => {
      if (mediaDevice.kind === "audioinput") {
        const found = existingDevices.find((device) =>
          [mediaDevice.label].includes(device.label)
        );
        if (!found) {
          existingDevices.push({
            label: mediaDevice.label,
            value: mediaDevice.label,
          });
        }
      }
    });
  }

  render() {
    const device = this.getPropertyFor("from");
    const label = this.getLabelFromPropertySelect(device);
    const channel = this.getPropertyFor("channelCount");
    const labelChannel = this.getLabelFromPropertySelect(channel);

    return `
      <div>
        <div class="title-box">
           <i class="fas fa-${this.constructor.icon}"></i> <span id="from-${this._uuid}">${label}</span>
        </div>
        <div class="box">
            <i class="fas fa-chevron-right"></i><span class="object-details-value" id="channelCount-${this._uuid}">${labelChannel}</span>
             <div class="object-footer">
                <span class="object-node object-title-box">${this.constructor.name}</span>    
            </div>
        </div>
      </div>
    `;
  }
}

export default AudioTrack;