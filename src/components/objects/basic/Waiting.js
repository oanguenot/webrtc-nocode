import Main from "../Main";

class Waiting extends Main {
  static item = "Waiting";
  static description = "Wait a period before executing the next node";
  static icon = "stopwatch";
  static section = "basic";

  constructor(x, y) {
    super(x, y);
    this._inputs = 1;
    this._outputs = 1;
    this._acceptInputs = ["*"];
    this._acceptOutputs = ["*"];
    this._info = [{ key: "node", value: "waiting" }];
    this._properties = [
      {
        prop: "period",
        label: "Period",
        type: "enum",
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

  render() {
    const period = this.getPropertyFor("period");
    const label = this.getLabelFromPropertySelect(period);

    return `
      <div>
        <div class="title-box">
           <i class="fas fa-${this.constructor.icon}"></i> <span id="period-${this._uuid}">${label}</span>
        </div>
        <div class="box">
            <span class="object-full">Wait before executing the next node</span>
             <div class="object-footer">
                <span class="object-node object-title-box">${this.constructor.name}</span>    
            </div>
        </div>
      </div>
    `;
  }
}

export default Waiting;
