import { $showAnimationCheckbox } from "../bind";

const key = "oscilloscope-hide-animation";

export function setupShowAnimationCheckbox() {
  try {
    const value = localStorage.getItem(key);
    if (value !== null) {
      $showAnimationCheckbox.checked = value !== "1";
    }
    $showAnimationCheckbox.addEventListener("change", () => {
      try {
        if ($showAnimationCheckbox.checked) {
          localStorage.removeItem(key);
          return;
        }
        localStorage.setItem(key, "1");
      } catch (error) {}
    });
  } catch (error) {}
}
