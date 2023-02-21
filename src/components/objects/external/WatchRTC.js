import Main from "../Main";

class WatchRTC extends Main {
  static item = "WatchRTC";
  static description = "Analyze calls on testRTC platform";
  static icon = "ruler";
  static section = "builtin";
  static name = "WatchRTC";

  constructor(x, y) {
    super(x, y);
    this._inputs = 1;
    this._outputs = 0;
    this._info = [
      { key: "node", value: "rtc.watchrtc" },
      {
        key: "info",
        value:
          "Create a probe to analyze the data sent and received by this RTCPeerConnection",
      },
    ];
    this._acceptInputs = ["rtc.peer"];
    this._properties = [
      {
        prop: "name",
        label: "Name",
        type: "text",
        value: `WatchRTC SDK`,
        description: "Name of the tool",
      },
      {
        prop: "apiKey",
        label: "API Key",
        type: "text",
        value: "",
        description: "API Key to use",
      },
      {
        prop: "roomId",
        label: "Room ID",
        type: "text",
        value: "",
        description: "Name of the room",
      },
      {
        prop: "peerId",
        label: "Peer ID",
        type: "text",
        value: "",
        description: "Name of the peer",
      },
    ];
  }

  renderProp(prop) {
    const property = this.getPropertyFor(prop);

    switch (prop) {
      case "name":
        return property.value;
      case "apiKey":
        return `key: ${property.value ? property.value.substring(0, 10) + "..." : "none"}`;
      case "roomId":
        return property.value ? `$room ${property.value}` : "no ID for room";
      case "peerId":
        return property.value ? `user ${property.value}` : "no ID for peer";
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
            <i class="fas fa-chevron-right"></i><span class="object-details-value" id="apiKey-${
      this._uuid
    }">${this.renderProp("apiKey")}</span>
            </div>
            <div class="object-box-line">
            <i class="fas fa-chevron-right"></i><span class="object-details-value" id="roomId-${
      this._uuid
    }">${this.renderProp("roomId")}</span>
            </div>
            <div class="object-box-line">
            <i class="fas fa-chevron-right"></i><span class="object-details-value" id="peerId-${
      this._uuid
    }">${this.renderProp("peerId")}</span>
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

export default WatchRTC;
