import Main from "../Main";
import { KEY_TYPE, KEYS, NODES } from "../../../modules/model";

class End extends Main {
  static item = "End";
  static description = "Terminate the scenario";
  static icon = "flag-checkered";
  static section = "events";
  static name = "End";

  constructor(x, y) {
    super(x, y);
    this._inputs = 1;
    this._outputs = 0;
    this._info = [
      { key: KEYS.NODE, value: NODES.END },
      {
        key: KEYS.INFO,
        value: "Terminate the scenario and release all media and devices",
      },
    ];
    this._acceptInputs = ["*"];
    this._properties = [
      {
        prop: KEYS.NAME,
        label: "Name",
        type: KEY_TYPE.TEXT,
        value: "FINISH",
        description: "Name of the End node",
        default: "FINISH",
      },
    ];
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

  execute(nodes, frames, reporter) {
    return new Promise((resolve, reject) => {
      const tickets = [];
      Object.keys(frames).forEach((key) => {
        const winFrame = frames[key];
        reporter({
          win: winFrame,
          name: "close",
          category: "playground",
          details: "",
          data: {},
          timestamp: Date.now(),
          ended: null,
        });
        if (winFrame && winFrame.pc) {
          winFrame.pc.close();
        }
        if (winFrame && winFrame.stream) {
          winFrame.stream.getTracks().forEach((track) => track.stop());
        }

        let ticket = null;
        if (winFrame && winFrame.metrics && winFrame.metrics.running) {
          winFrame.metrics.stopAllProbes();
          ticket = winFrame.probe.getTicket();
          tickets.push(ticket);
        }

        //Remove iframe element
        const iframe = document.querySelector(`#iframe_${key}`);
        iframe.parentNode.removeChild(iframe);
        delete frames[key];
      });
      console.log(">>>TIK", tickets);
      resolve(tickets);
    });
  }

  render() {
    return `
      <div>
        <div class="title-box">
          <i class="fas fa-${this.constructor.icon}"></i> <span id="name-${
      this._uuid
    }">${this.renderProp(KEYS.NAME)}</span>
        </div>
        <div class="box">
            <span class="object-full">Well done! Your scenario is finished and stopped.</span>
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

export default End;
