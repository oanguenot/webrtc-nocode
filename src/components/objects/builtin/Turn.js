import Main from "../Main";

class Turn extends Main {
  static item = "Turn Server";
  static description = "Connect using a Turn Server";
  static icon = "bezier-curve";
  static section = "builtin";
  static name = "Turn";

  constructor(x, y) {
    super(x, y);
    this._inputs = 0;
    this._outputs = 0;
    this._info = [
      { key: "node", value: "rtc.turn" },
      {
        key: "info",
        value: "Configure a STUN and TURN server to use for any calls",
      },
    ];
    this._acceptInputs = [];
    this._acceptOutputs = [];
    this._properties = [
      {
        prop: "name",
        label: "Name",
        type: "text",
        value: "STUN & TURN",
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

  renderProp(prop) {
    const property = this.getPropertyFor(prop);
    const label = this.getLabelFromPropertySelect(property);

    switch (prop) {
      case "name":
        return property.value;
      case "stun":
        return !!property.value.length
          ? `${property.value.substring(0, 18)}...`
          : "no STUN";
      case "turn":
        return !!property.value.length
          ? `${property.value.substring(0, 18)}...`
          : "no TURN";
      case "token":
        return !!property.value.length ? "*****" : "no token";
    }
  }

  render() {
    return `
      <div>
        <div class="title-box">
          <i class="fas fa-${this.constructor.icon}"></i> <span id="name-${
      this._uuid
    }">${this.renderProp("name")}</span>
        </div>
         <div class="box">
            <div class="object-box-line">
            <i class="fas fa-chevron-right"></i><span class="object-details-value" id="stun-${
              this._uuid
            }">${this.renderProp("stun")}</span>
            </div>
            <div class="object-box-line">
            <i class="fas fa-chevron-right"></i><span class="object-details-value" id="turn-${
              this._uuid
            }">${this.renderProp("turn")}</span>
            </div>
            <div class="object-box-line">
            <i class="fas fa-chevron-right"></i><span class="object-details-value" id="token-${
              this._uuid
            }">${this.renderProp("token")}</span>
            </div>
             <div class="object-footer">
                <span class="object-node object-title-box">${
                  this._info[0].value
                }.${this._uuid}
                </span>    
            </div>
        </div>
      </div>
      `;
  }
}

export default Turn;
