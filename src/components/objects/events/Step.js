import Main from "../Main";
import { nanoid } from "nanoid";

class Step extends Main {
  static item = "Step";
  static description = "Define a new step";
  static icon = "hashtag";
  static section = "events";
  static name = "Step";

  constructor(x, y) {
    super(x, y);
    this._inputs = 0;
    this._outputs = 1;
    this._acceptInputs = [];
    this._info = [
      { key: "node", value: "step" },
      { key: "uuid", value: nanoid(15) },
    ];
    this._properties = [
      {
        prop: "name",
        label: "Name",
        type: "text",
        value: `${nanoid(5)}`,
        description: "Name of the Step",
      },
    ];
    this._sources = [];
  }

  render() {
    return `
      <div>
        <div class="title-box">
           <i class="fas fa-${this.constructor.icon}"></i> <span id="name-${this._uuid}">${this._properties[0].value}</span>
        </div>
        <div class="box">
            <span class="object-full">This is a new step. Call it from a Goto node to execute this line</span>
             <div class="object-footer">
                <span class="object-node object-title-box">${this.node}</span>    
            </div>
        </div>
      </div>
    `;
  }
}

export default Step;
