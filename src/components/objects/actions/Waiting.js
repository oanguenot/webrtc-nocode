import Main from "../Main";
import { KEY_TYPE, KEYS, NODES } from "../../../modules/model";

class Waiting extends Main {
  static item = "Wait";
  static description = "Wait a period before executing the next node";
  static icon = "stopwatch";
  static section = "actions";
  static name = "Waiting";

  constructor(x, y) {
    super(x, y);
    this._inputs = 1;
    this._outputs = 1;
    this._acceptInputs = [NODES.EVENTS, NODES.ACTIONS];
    this._acceptOutputs = [NODES.ACTIONS];
    this._info = [
      { key: KEYS.NODE, value: "action.wait" },
      {
        key: KEYS.INFO,
        value: "Wait a moment before executing the next node",
      },
    ];
    this._properties = [
      {
        prop: KEYS.DELAY,
        label: "Delay",
        type: KEY_TYPE.ENUM,
        enum: [
          { label: "1 second", value: "1000" },
          { label: "3 seconds", value: "3000" },
          { label: "5 seconds", value: "5000" },
          { label: "10 seconds", value: "10000" },
          { label: "15 seconds", value: "15000" },
          { label: "20 seconds", value: "20000" },
          { label: "30 seconds", value: "30000" },
          { label: "45 seconds", value: "45000" },
          { label: "60 seconds", value: "60000" },
          { label: "90 seconds", value: "90000" },
          { label: "180 seconds", value: "180000" },
          { label: "300 seconds", value: "300000" },
        ],
        value: "10000",
        description: "Choose the period to wait",
      },
    ];
  }

  renderProp(prop) {
    const property = this.getPropertyFor(prop);
    const label = this.getLabelFromPropertySelect(property);

    switch (prop) {
      case KEYS.DELAY:
        return `Wait ${label}`;
    }
  }

  render() {
    return `
      <div>
        <div class="title-box">
           <i class="fas fa-${this.constructor.icon}"></i> <span id="delay-${
      this._uuid
    }">${this.renderProp(KEYS.DELAY)}</span>
        </div>
        <div class="box">
             <div class="object-footer">
                <span class="object-node object-title-box">${
                  this._info[0].value
                }.${this._uuid}
                </span>      
            </div>
        </div>
      </div>
    `;
  }
}

export default Waiting;
