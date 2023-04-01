import Main from "../Main";
import { NODES, KEYS, KEY_TYPE } from "../../../modules/model";

class Ready extends Main {
  static item = "Ready";
  static description = "Handle playground ready";
  static icon = "traffic-light";
  static section = "events";
  static name = "Ready";

  constructor(x, y) {
    super(x, y);
    this._inputs = 0;
    this._outputs = 1;
    this._info = [
      { key: KEYS.NODE, value: NODES.READY },
      {
        key: KEYS.INFO,
        value: "Triggers actions to execute when the playground is ready!",
      },
    ];
    this._properties = [
      {
        prop: KEYS.NAME,
        label: "Name",
        type: KEY_TYPE.TEXT,
        value: `ON READY`,
        description: "Name of the event",
      },
    ];
    this._acceptOutputs = [NODES.ACTIONS];
    this._acceptInputs = [];
    this._sources = [];
    this._targets = [];
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
            <span class="object-full">Link nodes to create your scenario!</span>
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

export default Ready;
