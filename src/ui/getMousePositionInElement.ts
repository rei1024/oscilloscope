export function getMousePositionInElement(
  element: Element,
  mouseEvent: MouseEvent,
) {
  const rect = element.getBoundingClientRect();
  return {
    x: mouseEvent.clientX - rect.left,
    y: mouseEvent.clientY - rect.top,
  };
}
