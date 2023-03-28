import Main from "../Main";

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
    this._acceptOutputs = ["rtc.peer"];
    this._info = [
      { key: "node", value: "rtc.track" },
      { key: "kind", value: "audio" },
      {
        key: "info",
        value: "Get the MediaStreamTrack instance from the selected device",
      },
    ];
    this._properties = [
      {
        prop: "from",
        label: "From",
        type: "enum",
        enum: [
          { label: "[Default]", value: "[default]" },
          { label: "None", value: "none" },
          { label: "Fake", value: "fake" },
        ],
        value: "[default]",
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
      case "from":
        return label;
      case "channelCount":
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
    }">${this.renderProp("from")}</span>
        </div>
        <div class="box">
            <i class="fas fa-headphones"></i><span class="object-details-value" id="channelCount-${
              this._uuid
            }">${this.renderProp("channelCount")}</span>
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
