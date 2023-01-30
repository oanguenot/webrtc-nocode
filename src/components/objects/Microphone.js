import Main from "./Main";

class Microphone extends Main {
  static description = "Add Audio Track";
  static icon = "microphone";

  constructor(x, y) {
    super(x, y);
    this._inputs = 1;
    this._outputs = 1;
    this._accept = ["*"];
    this._info = [
      { key: "node", value: "track" },
      { key: "kind", value: "audio" },
    ];
    this._properties = [
      {
        prop: "name",
        label: "Name",
        type: "text",
        value: "Audio Track",
        description: "Name of the track",
      },
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

    return `
      <div>
        <div class="title-box">
           <i class="fas fa-${this.constructor.icon}"></i> <span id="name-${this._uuid}">${this._properties[0].value}</span>
        </div>
        <div class="box">
            <i class="fas fa-chevron-right"></i><span class="object-details-value">${label}</span>
             <div class="object-footer">
                <span class="object-node object-title-box">Audio Track</span>    
            </div>
        </div>
      </div>
    `;
  }
}

export default Microphone;
