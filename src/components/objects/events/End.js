import Main from "../Main";
import { KEY_TYPE, KEYS, NODES } from "../../../modules/model";

class End extends Main {
  static item = "End";
  static description = "Terminate the scenario";
  static icon = "flag-checkered";
  static section = "events";
  static name = "End";

  constructor(x, y) {
    super(x, y);
    this._inputs = 1;
    this._outputs = 0;
    this._info = [
      { key: KEYS.NODE, value: NODES.END },
      {
        key: KEYS.INFO,
        value: "Terminate the scenario and release all media and devices",
      },
    ];
    this._acceptInputs = ["*"];
    this._acceptOutputs = [];
    this._properties = [
      {
        prop: KEYS.NAME,
        label: "Name",
        type: KEY_TYPE.TEXT,
        value: "FINISH",
        description: "Name of the End node",
      },
    ];
    this._sources = [];
  }

  renderProp(prop) {
    const property = this.getPropertyFor(prop);

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
    }">${this.renderProp(KEYS.NAME)}</span>
        </div>
        <div class="box">
            <span class="object-full">Well done! Your scenario is finished and stopped.</span>
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

export default End;
