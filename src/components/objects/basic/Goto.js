import Main from "../Main";

class Goto extends Main {
  static item = "Goto";
  static description = "Route to a new step";
  static icon = "level-down-alt";
  static section = "basic";

  constructor(x, y) {
    super(x, y);
    this._inputs = 1;
    this._outputs = 0;
    this._accept = ["*"];
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

  addStep(value, label) {
    const prop = this._properties.find((property) => property.prop === "next");
    const existingSteps = prop.enum;
    const found = existingSteps.find((step) => [value].includes(step.value));
    if (!found) {
      existingSteps.push({ label, value });
    }
  }

  addSteps(steps) {
    steps.forEach((step) => this.addStep(step.value, step.label));
  }

  updateStep(value, label) {
    const prop = this._properties.find((property) => property.prop === "next");
    const existingSteps = prop.enum;
    existingSteps.forEach((step) => {
      if (step.value === value) {
        step.label = label;
      }
    });
    if (prop.value === value) {
      this.updateName(label);
    }
  }

  render() {
    const value = this._properties[0].value;
    const enumLabel = this._properties[0].enum.find(
      (item) => item.value === value
    ).label;

    return `
      <div>
        <div class="title-box">
           <i class="fas fa-${this.constructor.icon}"></i> <span id="name-${this._uuid}">${this._properties[0].value}</span>
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
