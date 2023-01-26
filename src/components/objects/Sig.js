import Main from "./Main";

class Sig extends Main {
  constructor(x, y) {
    super(x, y);
    this._icon = "server";
    this._inputs = 1;
    this._outputs = 0;
    this._info = [{ key: "node", value: "sig" }];
    this._accept = ["user"];
    this._properties = [
      {
        prop: "name",
        label: "Name",
        type: "text",
        value: "Basic SIG Server",
        description: "Name of the SIG Server",
      },
      {
        prop: "delay",
        label: "Delay",
        type: "enum",
        enum: [
          { label: "Immediate", value: 0 },
          { label: "Low latency (100ms)", value: 100 },
          { label: "Medium latency (500ms)", value: 500 },
          { label: "High latency (1s)", value: 1000 },
          { label: "Very High latency (3s)", value: 3000 },
        ],
        value: 0,
        description: "Delay to wait before sending message to recipient",
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

export default Sig;
