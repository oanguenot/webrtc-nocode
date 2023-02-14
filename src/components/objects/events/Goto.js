import Main from "../Main";

class Goto extends Main {
  static item = "Goto";
  static description = "Route to a new step";
  static icon = "level-down-alt";
  static section = "events";
  static name = "Goto";

  constructor(x, y) {
    super(x, y);
    this._inputs = 1;
    this._outputs = 0;
    this._acceptInputs = ["*"];
    this._acceptOutputs = [];
    this._info = [{ key: "node", value: "goto" }];
    this._properties = [
      {
        prop: "next",
        label: "Go to Step",
        type: "enum",
        enum: [{ label: "None", value: "none" }],
        value: "none",
        description: "Select the next step",
      },
    ];
  }

  render() {
    const next = this.getPropertyFor("next");
    const label = this.getLabelFromPropertySelect(next);

    return `
      <div>
        <div class="title-box">
           <i class="fas fa-${this.constructor.icon}"></i> <span id="next-${this._uuid}">${label}</span>
        </div>
        <div class="box">
            <span class="object-full">Select the next step to execute. Once this line is completed, the next step will be executed.</span>
             <div class="object-footer">
                <span class="object-node object-title-box">${this.constructor.name}</span>    
            </div>
        </div>
      </div>
    `;
  }
}

export default Goto;
