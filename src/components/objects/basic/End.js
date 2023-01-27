import Main from "../Main";

class End extends Main {
  static description = "End";
  static icon = "flag-checkered";

  constructor(x, y) {
    super(x, y);
    this._inputs = 1;
    this._outputs = 0;
    this._info = [{ key: "node", value: "end" }];
    this._properties = [];
  }

  render() {
    return `
      <div>
        <div class="title-box">
          <i class="fas fa-${this.constructor.icon}"></i> <span id="name-${this._uuid}">END</span>
        </div>
      </div>
    `;
  }
}

export default End;
