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
      { key: "node", value: "encodings" },
      { key: "kind", value: "audio" },
    ];
    this._accept = ["*"];
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
    ];
  }

  render() {
    const name = this.getPropertyValueFor("name");
    const codec = this.getPropertyFor("preference");
    const labelCodec = this.getLabelFromPropertySelect(codec);
    const active = this.getPropertyFor("active");
    const labelActive = this.getLabelFromPropertySelect(active);
    const bitrate = this.getPropertyFor("maxBitrate");
    const labelBitrate = this.getLabelFromPropertySelect(bitrate);

    const item = `
      <div>
        <div class="title-box">
          <i class="fas fa-${this.constructor.icon}"></i> <span id="name-${this._uuid}">${name}</span>
        </div>
         <div class="box">
            <div class="object-box-line">
            <i class="fas fa-chevron-right"></i><span class="object-details-value" id="preference-${this._uuid}">${labelCodec}</span>
            </div>
            <div class="object-box-line">
            <i class="fas fa-chevron-right"></i><span class="object-details-value" id="active-${this._uuid}">${labelActive}</span>
            </div>
            <div class="object-box-line">
            <i class="fas fa-chevron-right"></i><span class="object-details-value" id="maxBitrate-${this._uuid}">${labelBitrate}</span>
            </div>
             <div class="object-footer">
                <span class="object-node object-title-box">${this.constructor.name}</span>    
            </div>
        </div>
      </div>
      `;
    return item;
  }
}

export default AudioEncodings;
