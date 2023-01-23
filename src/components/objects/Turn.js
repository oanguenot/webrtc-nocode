import Main from "./Main";

class Turn extends Main {
  constructor(x, y) {
    super(x, y);
    this._name = "turn";
    this._icon = "server";
    this._type = "turn";
    this._inputs = 1;
    this._outputs = 0;
  }

  render() {
    const item = `
      <div>
        <div class="title-box">
          <i class="fas fa-${this._icon}"></i> ${this._name}
        </div>
      </div>
      `;
    return item;
  }
}

export default Turn;
