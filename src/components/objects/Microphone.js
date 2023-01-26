import Main from "./Main";

class Microphone extends Main {
  constructor(x, y) {
    super(x, y);
    this._icon = "microphone";
    this._inputs = 0;
    this._outputs = 1;
    this._info = [
      { key: "node", value: "microphone" },
      { key: "kind", value: "audio" },
      { key: "type", value: "real" },
    ];
    this._properties = [
      {
        prop: "name",
        label: "Name",
        type: "text",
        value: "Microphone",
        description: "Name of the Microphone",
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

  render() {
    return `
      <div>
        <div class="title-box">
          <i class="fas fa-${this._icon}"></i> <span id="name-${this._uuid}">${this._properties[0].value}</span>
        </div>
      </div>
    `;
  }
}

export default Microphone;
