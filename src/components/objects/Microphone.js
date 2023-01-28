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
    list.forEach((mediaDevice) => {
      if (mediaDevice.kind === "audioinput") {
        // todo add audio input devices
      }
    });
  }

  render() {
    return `
      <div>
        <div class="title-box">
          <i class="fas fa-${this.constructor.icon}"></i> <span id="name-${this._uuid}">${this._properties[0].value}</span>
        </div>
      </div>
    `;
  }
}

export default Microphone;
