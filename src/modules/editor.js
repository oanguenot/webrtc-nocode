const Drawflow = window.Drawflow;
let editor = null;

export const createAndStartNewEditor = (element) => {
  editor = new Drawflow(element);
  editor.reroute = true;
  editor.start();
  return editor;
};

export const getEditor = () => {
  return editor;
};

export const getInitialPosition = (editor, posX, posY) => {
  const x =
    posX *
      (editor.precanvas.clientWidth /
        (editor.precanvas.clientWidth * editor.zoom)) -
    editor.precanvas.getBoundingClientRect().x *
      (editor.precanvas.clientWidth /
        (editor.precanvas.clientWidth * editor.zoom));
  const y =
    posY *
      (editor.precanvas.clientHeight /
        (editor.precanvas.clientHeight * editor.zoom)) -
    editor.precanvas.getBoundingClientRect().y *
      (editor.precanvas.clientHeight /
        (editor.precanvas.clientHeight * editor.zoom));

  return { x, y };
};
