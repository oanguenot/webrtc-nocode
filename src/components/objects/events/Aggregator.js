import Main from "../Main";
import { KEY_TYPE, KEYS, NODES } from "../../../modules/model";
import { generateCustomId4, getNodesFromIds } from "../../../modules/helper";

class Aggregator extends Main {
  static item = "Aggregator";
  static description = "Aggregate flows";
  static icon = "fast-forward";
  static section = "events";
  static name = "Aggregator";

  constructor(x, y) {
    super(x, y);

    this._inprogress = false;
    this._inputs = 3;
    this._outputs = 1;
    this._info = [
      { key: KEYS.NODE, value: NODES.AGGREGATOR },
      {
        key: KEYS.INFO,
        value: "Wait for all input nodes before continuing the scenario",
      },
    ];
    this._acceptInputs = ["*"];
    this._properties = [
      {
        prop: KEYS.NAME,
        label: "Name",
        type: KEY_TYPE.TEXT,
        value: `Aggre-${generateCustomId4()}`,
        description: "Name of the Aggregator node",
        default: "Aggre",
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
    const waitUntilAllNodesAreExecuted = () => {
      let id;
      return new Promise((resolve, reject) => {
        id = setInterval(() => {
          const inputNodes = getNodesFromIds(this.linksInput, nodes);
          const raced = inputNodes.every((node) => node.executed);
          if (raced) {
            clearInterval(id);
            resolve();
          }
        }, [1000]);
      });
    };

    return new Promise(async (resolve, _reject) => {
      if (!this._inprogress) {
        this._inprogress = true;
        await waitUntilAllNodesAreExecuted();
        resolve();
      }
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
            <span class="object-full">Wait until previous nodes are completed!</span>
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

export default Aggregator;
