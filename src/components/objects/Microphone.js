import Main from "./Main";

class Microphone extends Main {
  constructor(x, y) {
    super(x, y);
    this._icon = "microphone";
    this._inputs = 0;
    this._outputs = 1;
    this._info = [
      { key: "node", value: "microphone" },
      { key: "kind", value: "audioInput" },
      { key: "type", value: "real" },
    ];
    this._properties = {
      name: {
        label: "Name",
        type: "text",
        value: "Microphone",
        description: "Name of the Microphone",
      },
      channelCount: {
        label: "Channels Count",
        type: "enum",
        enum: [1, 2],
        value: 1,
        description: "Number of Channels (mono or stereo)",
      },
    };
  }

  render() {
    const item = `
      <div>
        <div class="title-box">
          <i class="fas fa-${this._icon}"></i> ${this._properties["name"].value}
        </div>
      </div>
      `;
    return item;
  }
}

export default Microphone;
