import Main from "../Main";

class VideoEncodings extends Main {
  static item = "Video Encodings";
  static description = "Select the encodings parameters";
  static icon = "shapes";
  static section = "actions";
  static name = "VideoEncodings";

  constructor(x, y) {
    super(x, y);
    this._inputs = 1;
    this._outputs = 1;
    this._info = [
      { key: "node", value: "action.encode" },
      { key: "kind", value: "video" },
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
        value: "Video Encode",
        description: "Name of the Encodings",
      },
      {
        prop: "preference",
        label: "Codec Preferences",
        type: "enum",
        enum: [
          { label: "VP8", value: "vp8" },
          { label: "VP9", value: "vp9" },
          { label: "H264", value: "h264" },
          { label: "AV1", value: "AV1" },
        ],
        value: "vp8",
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
          { label: "2 Mbps", value: 2000000 },
          { label: "1,5 Mbps", value: 1500000 },
          { label: "1 Mbps", value: 1000000 },
          { label: "500 Kbps", value: 500000 },
          { label: "250 Kbps", value: 250000 },
          { label: "100 Kbps", value: 100000 },
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
        return property.value;
      case "preference":
        return `use ${label}`;
      case "active":
        return property.value === "yes" ? "active" : "inactive";
      case "maxBitrate":
        return property.value === "unlimited"
          ? "no rate limit"
          : `limited to ${label}`;
      case "track":
        return property.value === "none" ? "no track" : `encode ${label}`;
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

export default VideoEncodings;
