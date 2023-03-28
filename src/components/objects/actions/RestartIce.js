import Main from "../Main";
import { KEY_TYPE, KEYS, NODES } from "../../../modules/model";

class RestartIce extends Main {
  static item = "RestartIce";
  static description = "Restart ICE";
  static icon = "recycle";
  static section = "actions";
  static name = "RestartIce";

  constructor(x, y) {
    super(x, y);
    this._inputs = 1;
    this._outputs = 1;
    this._info = [
      { key: KEYS.NODE, value: NODES.RESTARTICE },
      {
        key: KEYS.INFO,
        value: "Restart ICE",
      },
    ];
    this._acceptInputs = [NODES.EVENTS, NODES.ACTIONS];
    this._acceptOutputs = [NODES.ACTIONS];
    this._properties = [
      {
        prop: KEYS.NAME,
        label: "Name",
        type: KEY_TYPE.TEXT,
        value: "Restart ICE",
        description: "Action/Name",
      },
    ];
  }

  renderColorIsMissingProp(prop) {
    const property = this.getPropertyFor(prop);
    return property && property.value === "none";
  }

  renderProp(prop) {
    const property = this.getPropertyFor(prop);
    const label = this.getLabelFromPropertySelect(property);

    switch (prop) {
      case KEYS.NAME:
        return property.value;
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

export default RestartIce;
