import Main from "./Main";

class Camera extends Main {
  constructor(props) {
    super(props);
    this._name = "camera";
    this._icon = "video";
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

export default Camera;
