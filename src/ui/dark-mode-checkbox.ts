import { $darkModeCheckbox } from "../bind";

const key = "oscilloscope-dark-mode";

export function setupDarkModeCheckbox(onChange: () => void) {
  try {
    const value = localStorage.getItem(key);
    if (value !== null) {
      $darkModeCheckbox.checked = value === "dark";
    }
  } catch (error) {}

  $darkModeCheckbox.addEventListener("change", () => {
    try {
      if ($darkModeCheckbox.checked) {
        localStorage.setItem(key, "dark");
      } else {
        localStorage.removeItem(key);
      }
    } catch (error) {}

    onChange();
  });
}
