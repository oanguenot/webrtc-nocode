import Main from "../Main";
import { NODES, KEYS, KEY_TYPE } from "../../../modules/model";
import { configuration } from "../../../modules/metrics";
import { getNodeById } from "../../../modules/helper";

class Ready extends Main {
  static item = "Ready";
  static description = "Handle playground ready";
  static icon = "traffic-light";
  static section = "events";
  static name = "Ready";

  constructor(x, y) {
    super(x, y);
    this._inputs = 0;
    this._outputs = 1;
    this._info = [
      { key: KEYS.NODE, value: NODES.READY },
      {
        key: KEYS.INFO,
        value: "Triggers actions to execute when the playground is ready!",
      },
    ];
    this._properties = [
      {
        prop: KEYS.NAME,
        label: "Name",
        type: KEY_TYPE.TEXT,
        value: `ON READY`,
        description: "Name of the event",
      },
    ];
    this._acceptOutputs = [NODES.ACTIONS];
    this._acceptInputs = [];
    this._sources = [];
  }

  renderProp(prop) {
    const property = this.getPropertyFor(prop);

    switch (prop) {
      case KEYS.NAME:
        return property.value;
      default:
        return "";
    }
  }

  execute(nodes, frames) {
    return new Promise((resolve, reject) => {
      // Object.keys(frames).forEach((id) => {
      //   const win = frames[id];
      //
      //   const peerNode = getNodeById(id, nodes);
      //
      //   if (win && win.WebRTCMetrics) {
      //     win.metrics = new win.WebRTCMetrics(configuration);
      //     win.probe = win.metrics.createProbe(win.pc, {
      //       pname: peerNode.getPropertyValueFor(KEYS.NAME),
      //       uid: id,
      //       ticket: true,
      //       record: false,
      //     });
      //
      //     win.metrics.startAllProbes();
      //   }
      // });

      resolve();
    });
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
            <span class="object-full">Link nodes to create your scenario!</span>
             <div class="object-footer">
                <span class="object-node object-title-box">${
                  this.node
                }</span>    
            </div>
        </div>
      </div>
    `;
  }
}

export default Ready;
