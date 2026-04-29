import "./styles.css";
import { renderDashboard, wireDashboard } from "./components/dashboard";
import { applyTheme } from "./components/theme";
import { getActiveTheme } from "./services/storage";

const app = document.querySelector<HTMLDivElement>("#app");

function boot(): void {
  if (!app) return;
  const theme = getActiveTheme();
  applyTheme(theme);
  app.innerHTML = renderDashboard(theme);
  wireDashboard((nextTheme) => {
    app.innerHTML = renderDashboard(nextTheme);
    wireDashboard(() => undefined);
  });
}

boot();
window.addEventListener("resize", debounce(boot, 180));

let revealed = false;
function reveal() {
  if (revealed) return;
  revealed = true;
  const veil = document.getElementById("page-veil");
  if (!veil) return;
  veil.classList.add("done");
  veil.addEventListener("transitionend", () => veil.remove(), { once: true });
}
window.addEventListener("load", reveal);
setTimeout(reveal, 500);

function debounce(callback: () => void, delay: number): () => void {
  let handle = 0;
  return () => {
    window.clearTimeout(handle);
    handle = window.setTimeout(callback, delay);
  };
}
