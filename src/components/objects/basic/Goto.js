import Main from "../Main";

class Goto extends Main {
  static description = "Goto";
  static icon = "level-down-alt";

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

  render() {
    return `
      <div>
        <div class="title-box">
          <i class="fas fa-${this.constructor.icon}"></i> <span id="name-${this._uuid}">${this._properties[0].value}</span>
        </div>
      </div>
    `;
  }
}

export default Goto;
