import Main from "../Main";

class CallP2P extends Main {
  static item = "CallP2P";
  static description = "Call P2P";
  static icon = "phone-volume";
  static section = "actions";
  static name = "CallP2P";

  constructor(x, y) {
    super(x, y);
    this._inputs = 1;
    this._outputs = 1;
    this._info = [
      { key: "node", value: "action.call" },
      {
        key: "info",
        value: "Initiate a P2P call to a recipient by sending an offer",
      },
    ];
    this._acceptInputs = ["event.*"];
    this._acceptOutputs = ["action.*"];
    this._properties = [
      {
        prop: "name",
        label: "Name",
        type: "text",
        value: "Call P2P",
        description: "Action/Name",
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
      {
        prop: "peer",
        label: "Recipient",
        type: "enum",
        enum: [{ label: "None", value: "none" }],
        value: "none",
        description: "Choose the RTCPeerConnection to call",
      },
    ];
  }

  renderProp(prop) {
    const property = this.getPropertyFor(prop);
    const label = this.getLabelFromPropertySelect(property);

    switch (prop) {
      case "delay":
        return property.value === "0" ? "No latency" : `Latency of ${property.value}`;
      case "name":
        return property.value;
      case "peer":
        if(property.value === "none") {
          return "No recipient";
        }
        return `To ${label}`;
      default:
        return "";
    }
  }

  render() {
    return `
      <div>
        <div class="title-box">
          <i class="fas fa-${this.constructor.icon}"></i> <span id="name-${this._uuid}">${this.renderProp("name")}</span>
        </div>
        <div class="box">
         <div class="object-box-line">
            <i class="fas fa-chevron-right"></i><span class="object-details-value" id="peer-${this._uuid
    }">${this.renderProp("peer")}</span>
            </div>
        <div class="object-box-line">
            <i class="fas fa-chevron-right"></i><span class="object-details-value" id="delay-${this._uuid
    }">${this.renderProp("delay")}</span>
            </div>
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

export default CallP2P;
