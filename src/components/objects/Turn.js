import Main from "./Main";

class Turn extends Main {
  constructor(x, y) {
    super(x, y);
    this._icon = "server";
    this._inputs = 1;
    this._outputs = 0;
    this._info = [{ key: "node", value: "turn" }];
    this._properties = [
      {
        prop: "name",
        label: "Name",
        type: "text",
        value: "Turn",
        description: "Name of the Turn server",
      },
      {
        prop: "stun",
        label: "STUN Url",
        type: "text",
        value: "",
        description: "URL of the STUN server",
      },
      {
        prop: "turn",
        label: "TURN Url",
        type: "text",
        value: "",
        description: "Url of the TURN server",
      },
      {
        prop: "token",
        label: "TURN token",
        type: "text",
        value: "",
        description: "Token used for authenticating users",
      },
    ];
  }

  render() {
    const item = `
      <div>
        <div class="title-box">
          <i class="fas fa-${this._icon}"></i> ${this._properties[0].value}
        </div>
      </div>
      `;
    return item;
  }
}

export default Turn;
