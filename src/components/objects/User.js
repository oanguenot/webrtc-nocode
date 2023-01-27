import Main from "./Main";
import { nanoid } from "nanoid";

class User extends Main {
  static description = "Add User";
  static icon = "user";

  constructor(x, y) {
    super(x, y);
    this._inputs = 1;
    this._outputs = 1;
    this._info = [{ key: "node", value: "user" }];
    this._accept = ["microphone", "camera", "start"];
    this._properties = [
      {
        prop: "name",
        label: "Name",
        type: "text",
        value: `User-${nanoid(10)}`,
        description: "Name of the Microphone",
      },
      {
        prop: "role",
        label: "Role",
        type: "enum",
        enum: [
          { label: "Caller", value: "caller" },
          { label: "Called", value: "called" },
        ],
        value: "caller",
        description: "Choose the role",
      },
      {
        prop: "network",
        label: "Connection type",
        type: "enum",
        enum: [
          { label: "Any", value: "any" },
          { label: "Relay only", value: "relay" },
        ],
        value: "any",
        description: "Choose the connection type to use",
      },
    ];
  }

  render() {
    const item = `
      <div>
        <div class="title-box">
          <i class="fas fa-${this.constructor.icon}"></i> <span id="name-${this._uuid}">${this._properties[0].value}</span>
        </div>
      </div>
      `;
    return item;
  }
}

export default User;
