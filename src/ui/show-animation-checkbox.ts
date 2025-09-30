import { $showAnimationCheckbox } from "../bind";

const key = "oscilloscope-hide-animation";

export function setupShowAnimationCheckbox(onChange: () => void) {
  try {
    const value = localStorage.getItem(key);
    if (value !== null) {
      $showAnimationCheckbox.checked = value !== "1";
    }
  } catch (error) {}

  $showAnimationCheckbox.addEventListener("change", () => {
    try {
      if ($showAnimationCheckbox.checked) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, "1");
      }
    } catch (error) {}

    onChange();
  });
}
