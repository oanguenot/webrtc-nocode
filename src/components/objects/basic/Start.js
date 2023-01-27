import Main from "../Main";

class Start extends Main {
  static description = "Start";
  static icon = "dot-circle";

  constructor(x, y) {
    super(x, y);
    this._inputs = 0;
    this._outputs = 1;
    this._info = [{ key: "node", value: "start" }];
    this._properties = [];
  }

  render() {
    return `
      <div>
        <div class="title-box">
          <i class="fas fa-${this.constructor.icon}"></i> <span id="name-${this._uuid}">START</span>
        </div>
      </div>
    `;
  }
}

export default Start;
