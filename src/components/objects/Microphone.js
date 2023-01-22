import Main from "./Main";

class Microphone extends Main {
  constructor(props) {
    super(props);
    this._name = "microphone";
    this._icon = "microphone";
    this._inputs = 0;
    this._outputs = 1;
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

export default Microphone;
