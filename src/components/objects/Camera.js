import Main from "./Main";

class Camera extends Main {
  static description = "Add Camera";
  static icon = "video";

  constructor(x, y) {
    super(x, y);
    this._inputs = 0;
    this._outputs = 1;
    this._info = [
      { key: "node", value: "camera" },
      { key: "kind", value: "video" },
      { key: "type", value: "real" },
    ];
    this._properties = [
      {
        prop: "name",
        label: "Name",
        type: "text",
        value: "Camera",
        description: "Name of the Camera",
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
