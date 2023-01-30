import Main from "../Main";

class End extends Main {
  static description = "End";
  static icon = "flag-checkered";

  constructor(x, y) {
    super(x, y);
    this._inputs = 1;
    this._outputs = 0;
    this._info = [{ key: "node", value: "end" }];
    this._accept = ["*"];
    this._properties = [];
  }

  render() {
    return `
      <div>
        <div class="title-box">
           <i class="fas fa-${this.constructor.icon}"></i> <span id="name-${this._uuid}">FINISH</span>
        </div>
        <div class="box">
            <span class="object-full">Well done! Your scenario is finished and stopped.</span>
             <div class="object-footer">
                <span class="object-node object-title-box">End</span>    
            </div>
        </div>
      </div>
    `;
  }
}

export default End;
