import Main from "./Main";

class AudioEncodings extends Main {
  static item = "Audio Encodings";
  static description = "Select the encodings parameters";
  static icon = "shapes";
  static section = "builtin";

  constructor(x, y) {
    super(x, y);
    this._inputs = 1;
    this._outputs = 1;
    this._info = [
      { key: "node", value: "action.encode" },
      { key: "kind", value: "audio" },
      {
        key: "info",
        value:
          "Change the track's encoding associated to the RTCRtpSender. Equivalent to setParameters",
      },
    ];
    this._acceptInputs = ["rtc.peer", "event.*", "action.*"];
    this._acceptOutputs = ["action.*"];
    this._properties = [
      {
        prop: "name",
        label: "Name",
        type: "text",
        value: "Audio Encode",
        description: "Name of the Encodings",
      },
      {
        prop: "preference",
        label: "Codec Preferences",
        type: "enum",
        enum: [
          { label: "Opus", value: "opus" },
          { label: "G711", value: "g711" },
        ],
        value: "opus",
        description: "Choose the preferred codec to use",
      },
      {
        prop: "active",
        label: "Active",
        type: "enum",
        enum: [
          { label: "Yes", value: "yes" },
          { label: "No", value: "no" },
        ],
        value: "yes",
        description: "Choose if the stream is active",
      },
      {
        prop: "maxBitrate",
        label: "Max Bitrate",
        type: "enum",
        enum: [
          { label: "Unlimited", value: "unlimited" },
          { label: "512 Kbps", value: 5120000 },
          { label: "256 Kbps", value: 2560000 },
          { label: "128 Kbps", value: 1280000 },
          { label: "96 Kbps", value: 96000 },
          { label: "64 Kbps", value: 640000 },
          { label: "48 Kbps", value: 480000 },
          { label: "32 Kbps", value: 320000 },
          { label: "16 Kbps", value: 160000 },
        ],
        value: "unlimited",
        description: "Choose the maximum bitrate to use",
      },
      {
        prop: "track",
        label: "Track",
        type: "enum",
        enum: [{ label: "None", value: "none" }],
        value: "none",
        description: "Choose the track to update",
      },
    ];
  }

  renderProp(prop) {
    const property = this.getPropertyFor(prop);
    const label = this.getLabelFromPropertySelect(property);

    switch (prop) {
      case "name":
        return `on track ${property.value}`;
      case "preference":
        return `use ${label}`;
      case "active":
        return property.value === "yes" ? "active" : "inactive";
      case "maxBitrate":
        return property.value === "unlimited"
          ? "no rate limit"
          : `limited to ${label}`;
      case "track":
        return property.value === "none" ? "no track" : label;
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
            <i class="fas fa-chevron-right"></i><span class="object-details-value" id="track-${
              this._uuid
            }">${this.renderProp("track")}</span>
            </div>
            <div class="object-box-line">
            <i class="fas fa-chevron-right"></i><span class="object-details-value" id="preference-${
              this._uuid
            }">${this.renderProp("preference")}</span>
            </div>
            <div class="object-box-line">
            <i class="fas fa-chevron-right"></i><span class="object-details-value" id="active-${
              this._uuid
            }">${this.renderProp("active")}</span>
            </div>
            <div class="object-box-line">
            <i class="fas fa-chevron-right"></i><span class="object-details-value" id="maxBitrate-${
              this._uuid
            }">${this.renderProp("maxBitrate")}</span>
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

export default AudioEncodings;
