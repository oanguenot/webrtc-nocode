import Main from "../Main";
import { nanoid } from "nanoid";

class Step extends Main {
  static description = "Step";
  static icon = "hashtag";

  constructor(x, y) {
    super(x, y);
    this._inputs = 0;
    this._outputs = 1;
    this._info = [{ key: "node", value: "step" }];
    this._properties = [
      {
        prop: "name",
        label: "Name",
        type: "text",
        value: `${nanoid(5)}`,
        description: "Name of the Step",
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

export default Step;
