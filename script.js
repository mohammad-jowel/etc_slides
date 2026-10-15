/* ==========================================================================
   Slide deck controls
   - scales the 1920x1080 slides to fit the window
   - Next:     Right / Down / Space / PageDown / click / scroll down / swipe left
   - Previous: Left / Up / PageUp / scroll up / swipe right
   - Home / End jump to the first / last slide, F toggles full screen
   - The URL hash (#3) remembers the current slide
   ========================================================================== */

const SLIDE_WIDTH = 1920;
const SLIDE_HEIGHT = 1080;

const deck = document.querySelector(".deck");
const slides = Array.from(document.querySelectorAll(".slide"));
const pager = document.querySelector(".pager");

let current = 0;
let pagerTimer;

/* ---- Show one slide ---- */
function showSlide(index) {
  current = Math.max(0, Math.min(slides.length - 1, index));

  slides.forEach((slide, i) => {
    slide.classList.toggle("is-active", i === current);
    slide.setAttribute("aria-hidden", i === current ? "false" : "true");
  });

  history.replaceState(null, "", "#" + (current + 1));
  showPager();
}

function next() { showSlide(current + 1); }
function previous() { showSlide(current - 1); }

/* ---- "3 / 12" counter, hidden again after 1.6 s ---- */
function showPager() {
  pager.textContent = current + 1 + " / " + slides.length;
  pager.classList.add("is-visible");
  clearTimeout(pagerTimer);
  pagerTimer = setTimeout(() => pager.classList.remove("is-visible"), 1600);
}

/* ---- Scale slides to the window ---- */
function fitToWindow() {
  const scale = Math.min(
    window.innerWidth / SLIDE_WIDTH,
    window.innerHeight / SLIDE_HEIGHT
  );
  deck.style.setProperty("--scale", scale);
}

/* ---- Keyboard ---- */
document.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "ArrowRight":
    case "ArrowDown":
    case "PageDown":
    case " ":
      event.preventDefault();
      next();
      break;
    case "ArrowLeft":
    case "ArrowUp":
    case "PageUp":
      event.preventDefault();
      previous();
      break;
    case "Home":
      showSlide(0);
      break;
    case "End":
      showSlide(slides.length - 1);
      break;
    case "f":
    case "F":
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen();
      break;
  }
});

/* ---- Mouse: click on the right 2/3 of the screen = next, left 1/3 = back ---- */
deck.addEventListener("click", (event) => {
  if (event.clientX < window.innerWidth / 3) previous();
  else next();
});

/* ---- Mouse wheel and touchpad scroll ----
   A touchpad fires dozens of wheel events for one swipe (and keeps firing
   while it glides), so we change slide once and then ignore wheel events
   until the scrolling has stopped for a moment. */
let wheelLocked = false;
let wheelTimer;

window.addEventListener("wheel", (event) => {
  event.preventDefault();

  const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;

  if (!wheelLocked && Math.abs(delta) > 4) {
    wheelLocked = true;
    if (delta > 0) next();
    else previous();
  }

  // Unlock only after the wheel / touchpad has been quiet for 150 ms
  clearTimeout(wheelTimer);
  wheelTimer = setTimeout(() => { wheelLocked = false; }, 150);
}, { passive: false });

/* ---- Touch swipe ---- */
let touchStartX = 0;

deck.addEventListener("touchstart", (event) => {
  touchStartX = event.changedTouches[0].clientX;
});

deck.addEventListener("touchend", (event) => {
  const distance = event.changedTouches[0].clientX - touchStartX;
  if (Math.abs(distance) < 40) return;   // too small, treat as a tap
  if (distance < 0) next();
  else previous();
});

/* ---- Start ---- */
window.addEventListener("resize", fitToWindow);
window.addEventListener("hashchange", () => showSlide(Number(location.hash.slice(1)) - 1 || 0));

fitToWindow();
showSlide((Number(location.hash.slice(1)) || 1) - 1);