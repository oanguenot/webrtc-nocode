import Main from "../Main";

class Start extends Main {
  static item = "Start";
  static description = "Initiate the scenario";
  static icon = "dot-circle";
  static section = "basic";

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
           <i class="fas fa-${this.constructor.icon}"></i> <span id="name-${this._uuid}">START HERE</span>
        </div>
        <div class="box">
            <span class="object-full">Initial node. Add and connect other nodes to this one to build your scenario.</span>
             <div class="object-footer">
                <span class="object-node object-title-box">Start</span>    
            </div>
        </div>
      </div>
    `;
  }
}

export default Start;
