'use strict';

const ready = async () => {
  console.log(`[IFRAME] :: ready`);

  window.addEventListener('message', function (e) {
    console.log(`[IFRAME] <-- [MAIN] :: ${JSON.stringify(e.data)}`);
    switch (e.data.evt) {
      case "create-peer":
        break;
      default:
        break;
    }
  });

}

document.addEventListener("DOMContentLoaded", ready);
