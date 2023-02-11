const createIFrame = (peerNode) => {
  const iframesElt = document.querySelector("#frames");
  const iframe = document.createElement('iframe');

  iframe.setAttribute("id", peerNode.id);
  iframe.src = "./iframe.html";
  iframesElt.appendChild(iframe);
}


const createPeerConnection = (peerNode) => {

}


export const execute = (nodes) => {
  return new Promise((resolve, reject) => {
    // found peer connections for creating iFrame
    const peers = nodes.filter(item => (item.node === "rtc.peer"));
    peers.forEach(peer => {
      createIFrame(peer);
      createPeerConnection(peer);
    });

    resolve();
  });
}
