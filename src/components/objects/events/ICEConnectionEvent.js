import Main from "../Main";
import { NODES, KEYS, KEY_TYPE } from "../../../modules/model";

class ICEConnectionEvent extends Main {
  static item = "ICE State Change";
  static description = "Handle ICE Connection state event";
  static icon = "bolt";
  static section = "events";
  static name = "ICEConnectionEvent";

  constructor(x, y) {
    super(x, y);
    this._inputs = 0;
    this._outputs = 1;
    this._info = [
      { key: KEYS.NODE, value: NODES.ICE },
      {
        key: KEYS.INFO,
        value: "Triggers actions to execute on ICE Connection state change!",
      },
    ];
    this._properties = [
      {
        prop: KEYS.NAME,
        label: "Name",
        type: KEY_TYPE.TEXT,
        value: `ON ICE CHANGE`,
        description: "Action/Name",
        default: "ON ICE CHANGE",
      },
      {
        prop: KEYS.ICESTATE,
        label: "State",
        type: KEY_TYPE.ENUM,
        enum: [
          { label: "Connected", value: "connected" },
          { label: "Disconnected", value: "disconnected" },
          { label: "Failed", value: "failed" },
        ],
        value: "connected",
        description: "Name of the State",
      },
      {
        prop: KEYS.PEER,
        label: "From",
        type: KEY_TYPE.ENUM,
        enum: [{ label: "None", value: "none" }],
        value: "none",
        description: "Choose the Peer to check",
      },
    ];
    this._acceptOutputs = [NODES.ACTIONS];
    this._acceptInputs = [];
    this._sources = [`${KEYS.NAME}:${KEYS.PEER}@${NODES.PEER}`];
  }

  renderProp(prop) {
    const property = this.getPropertyFor(prop);
    const label = this.getLabelFromPropertySelect(property);

    switch (prop) {
      case KEYS.NAME:
        return property.value;
      case KEYS.ICESTATE: {
        const label = this.getLabelFromPropertySelect(property);
        return `on ${label}`;
      }
      case KEYS.PEER:
        return property.value === "none" ? "[no peer]" : `[${label}]`;
      default:
        return "";
    }
  }

  execute() {
    return new Promise((resolve, _reject) => {
      resolve();
    });
  }

  render() {
    return `
      <div>
        <div class="title-box">
           <i class="fas fa-${this.constructor.icon}"></i> <span id="name-${
      this._uuid
    }">${this.renderProp(KEYS.NAME)}</span>
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
              <i class="fas fa-chevron-right"></i>
              <span class="object-details-value" id="iceState-${
                this._uuid
              }">${this.renderProp(KEYS.ICESTATE)}</span>
            </div>
             <div class="object-footer">
                <span class="object-node object-title-box">${
                  this.node
                }</span>    
            </div>
        </div>
      </div>
    `;
  }
}

export default ICEConnectionEvent;
