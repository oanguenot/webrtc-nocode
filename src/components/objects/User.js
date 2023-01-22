import Main from "./Main";

class User extends Main {
  constructor(props) {
    super(props);
    this._name = "user";
    this._icon = "user";
    this._inputs = 2;
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

export default User;
