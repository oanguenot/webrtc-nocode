import Main from "../Main";
import { KEY_TYPE, KEYS, NODES } from "../../../modules/model";

class CallP2P extends Main {
  static item = "CallP2P";
  static description = "Call P2P";
  static icon = "phone-volume";
  static section = "actions";
  static name = "CallP2P";

  constructor(x, y) {
    super(x, y);
    this._inputs = 2;
    this._outputs = 1;
    this._info = [
      { key: KEYS.NODE, value: NODES.CALL },
      {
        key: KEYS.INFO,
        value: "Initiate a P2P call to a recipient by sending an offer",
      },
    ];
    this._acceptInputs = [NODES.EVENTS, NODES.ACTIONS, NODES.MUNGING];
    this._acceptOutputs = [NODES.ACTIONS];
    this._properties = [
      {
        prop: KEYS.NAME,
        label: "Name",
        type: KEY_TYPE.TEXT,
        value: "Call P2P",
        description: "Action/Name",
      },
      {
        prop: KEYS.DELAY,
        label: "Delay",
        type: KEY_TYPE.ENUM,
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
        prop: KEYS.PEER,
        label: "Recipient",
        type: KEY_TYPE.ENUM,
        enum: [{ label: "None", value: "none" }],
        value: "none",
        description: "Choose the RTCPeerConnection to call",
      },
    ];
    this._sources = [`${KEYS.NAME}:${KEYS.PEER}@${NODES.PEER}`];
    this._targets = [`${KEYS.NAME}:${KEYS.CALL}@${NODES.RESTARTICE}`];
  }

  renderProp(prop) {
    const property = this.getPropertyFor(prop);
    const label = this.getLabelFromPropertySelect(property);

    switch (prop) {
      case KEYS.DELAY:
        return property.value === "0"
          ? "No latency"
          : `Latency of ${property.value}`;
      case KEYS.NAME:
        return property.value;
      case KEYS.PEER:
        if (property.value === "none") {
          return "No recipient";
        }
        return label;
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
    }">${this.renderProp("name")}</span>
        </div>
        <div class="box">
         <div class="object-box-line">
            <i id="peer-color-${this._uuid}" class="fas fa-portrait ${
      this.renderColorIsMissingProp(KEYS.PEER) ? "red" : ""
    }"></i><span class="object-details-value ${
      this.renderColorIsMissingProp(KEYS.PEER) ? "red" : ""
    }" id="peer-${this._uuid}">${this.renderProp(KEYS.PEER)}</span>
            </div>
        <div class="object-box-line">
            <i class="fas fa-chevron-right"></i><span class="object-details-value" id="delay-${
              this._uuid
            }">${this.renderProp(KEYS.DELAY)}</span>
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
