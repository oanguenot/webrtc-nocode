class Microphone {
  constructor(props) {
    this._name = "main";
    this._icon = "";
    this._inputs = 1;
    this._outputs = 1;
  }

  get inputs() {
    return this._inputs;
  }

  get outputs() {
    return this._outputs;
  }

  get name() {
    return this._name;
  }

  render() {
    return "";
  }
}

export default Microphone;
