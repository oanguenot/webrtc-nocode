'use strict';

const ready = async () => {
  console.log(`[IFRAME] :: ready`);
  const localVideo = document.querySelector("#localVideo");
  const startButton = document.querySelector("#start");
  localVideo.addEventListener("loadedmetadata", () => {
    console.log("[IFRAME] :: video loaded");
  });

  const createPeer = () => {

  }

  window.addEventListener('message', function (e) {
    console.log(`[IFRAME] <-- [MAIN] :: ${JSON.stringify(e.data)}`);
    switch (e.data.evt) {
      case "create-peer":
        createPeer();
        break;
      default:
        break;
    }
  });

}

document.addEventListener("DOMContentLoaded", ready);
