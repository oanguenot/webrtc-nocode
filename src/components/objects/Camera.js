import Main from "./Main";

class Camera extends Main {
  static description = "Add a Video Track";
  static icon = "video";

  constructor(x, y) {
    super(x, y);
    this._inputs = 1;
    this._outputs = 1;
    this._accept = ["*"];
    this._info = [
      { key: "node", value: "track" },
      { key: "kind", value: "video" },
    ];
    this._properties = [
      {
        prop: "name",
        label: "Name",
        type: "text",
        value: "Video Track",
        description: "Name of the track",
      },
      {
        prop: "from",
        label: "From",
        type: "enum",
        enum: [{ label: "Fake", value: "fake" }],
        value: "fake",
        description: "Choose the preferred camera",
      },
      {
        prop: "framerate",
        label: "Framerate",
        type: "enum",
        enum: [
          { label: "1 fps", value: 1 },
          { label: "6 fps", value: 5 },
          { label: "12 fps", value: 12 },
          { label: "24 fps", value: 24 },
          { label: "30 fps", value: 30 },
          { label: "60 fps", value: 60 },
        ],
        value: 30,
        description: "Number of frames per second",
      },
      {
        prop: "resolution",
        label: "Resolution",
        type: "enum",
        enum: [
          { label: "480p", value: "480p" },
          { label: "HD", value: "720p" },
          { label: "Full HD", value: "1080p" },
          { label: "2K", value: "2k" },
          { label: "4K", value: "4k" },
        ],
        value: "720p",
        description: "Choose a resolution",
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

export default Camera;
