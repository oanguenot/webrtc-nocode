import Main from "./Main";
import { nanoid } from "nanoid";

class User extends Main {
  constructor(x, y) {
    super(x, y);
    this._icon = "user";
    this._inputs = 2;
    this._outputs = 1;
    this._info = [{ key: "node", value: "user" }];
    this._properties = [
      {
        prop: "name",
        label: "Name",
        type: "text",
        value: `User-${nanoid(10)}`,
        description: "Name of the Microphone",
      },
    ];
  }

  render() {
    const item = `
      <div>
        <div class="title-box">
          <i class="fas fa-${this._icon}"></i> <span id="name-${this._uuid}">${this._properties[0].value}</span>
        </div>
      </div>
      `;
    return item;
  }
}

export default User;
