import Main from "./Main";

class VideoEncodings extends Main {
  static description = "Encode Video";
  static icon = "shapes";

  constructor(x, y) {
    super(x, y);
    this._inputs = 1;
    this._outputs = 0;
    this._info = [
      { key: "node", value: "videoEncodings" },
      { key: "kind", value: "video" },
    ];
    this._accept = ["camera"];
    this._properties = [
      {
        prop: "name",
        label: "Name",
        type: "text",
        value: "Encode",
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
    ];
  }

  render() {
    const item = `
      <div>
        <div class="title-box">
          <i class="fas fa-${this.constructor.icon}"></i> <span id="name-${this._uuid}">${this._properties[0].value}</span>
        </div>
      </div>
      `;
    return item;
  }
}

export default VideoEncodings;
