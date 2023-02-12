import Main from "../Main";

class Ready extends Main {
  static item = "Ready";
  static description = "Handle playground ready";
  static icon = "bolt";
  static section = "basic";

  constructor(x, y) {
    super(x, y);
    this._inputs = 0;
    this._outputs = 1;
    this._info = [
      { key: "node", value: "event.ready" },
      {
        key: "info",
        value: "Triggers actions to execute when the playground is ready!",
      },
    ];
    this._properties = [
      {
        prop: "delay",
        label: "Delay",
        type: "enum",
        enum: [
          { label: "No delay", value: "none" },
          { label: "1 second", value: "1000" },
          { label: "2 seconds", value: "2000" },
          { label: "3 seconds", value: "3000" },
          { label: "5 seconds", value: "5000" },
          { label: "10 seconds", value: "10000" },
          { label: "15 seconds", value: "15000" },
          { label: "30 seconds", value: "30000" },
        ],
        value: "none",
        description: "Name of the Step",
      },
      {
        prop: "peer",
        label: "Peer",
        type: "enum",
        enum: [{ label: "None", value: "none" }],
        value: "none",
        description: "Choose the RTCPeerConnection to execute an action",
      },
    ];
    this._acceptOutputs = ["action.*"];
    this._acceptInputs = [];
  }

  renderProp(prop) {
    const property = this.getPropertyFor(prop);

    switch (prop) {
      case "delay": {
        const label = this.getLabelFromPropertySelect(property);
        if (property.value === "none") {
          return "No delay";
        }
        return `after ${label}`;
      }
      default:
        return "";
    }
  }

  render() {
    return `
      <div>
        <div class="title-box">
           <i class="fas fa-${this.constructor.icon}"></i> <span id="name-${
      this._uuid
    }">ON READY</span>
        </div>
        <div class="box">
            <div class="object-box-line">
            <i class="fas fa-chevron-right"></i><span class="object-details-value" id="delay-${
              this._uuid
            }">${this.renderProp("delay")}</span>
            </div>
             <div class="object-footer">
                <span class="object-node object-title-box">${
                  this._info[0].value
                }</span>    
            </div>
        </div>
      </div>
    `;
  }
}

export default Ready;
