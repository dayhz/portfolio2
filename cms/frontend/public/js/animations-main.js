// Animations principales - Menu mobile et navigation
const menuTimeline = gsap.timeline({ paused: true });
const menuChangeColor = gsap.timeline({ paused: true, duration: 0.3 })
  .to(".menu_mobile", { backgroundColor: "#fff", zIndex: 100 })
  .to(".menu_mobile-line", { backgroundColor: "#111", top: "50%", duration: 0.2 }, "<")
  .to(".menu_mobile-line._01", { transformOrigin: "50% 50%", rotate: 45, ease: "back(1)", duration: 0.3 }, ">")
  .to(".menu_mobile-line._02", { transformOrigin: "50% 50%", rotate: -45, ease: "back(1)", duration: 0.3 }, "<");

menuTimeline.to(".menu_mobile", { duration: 0.5, scale: 1, ease: "back.out(1.7)" });

ScrollTrigger.create({
  trigger: "nav",
  start: "+=300 top",
  end: "top bottom",
  toggleActions: "play none none reverse",
  onEnter: () => {
    menuTimeline.play();
    menuChangeColor.reverse();
  },
  onLeaveBack: () => {
    menuTimeline.reverse();
    menuChangeColor.reverse();
  }
});

document.querySelector(".menu_mobile").addEventListener("click", (() => {
  if (0 !== menuTimeline.progress() && 1 !== menuTimeline.progress()) return;
  0 === menuChangeColor.progress() ? menuChangeColor.play() : menuChangeColor.reverse();
}));