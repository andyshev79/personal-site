// Navbar scroll effect
const navbar = document.getElementById("navbar");
window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 40);
});

// Mobile burger menu
const burger = document.getElementById("burger");
const navLinks = document.querySelector(".nav-links");
burger?.addEventListener("click", () => {
  const open = navLinks.style.display === "flex";
  navLinks.style.display = open ? "none" : "flex";
  navLinks.style.flexDirection = "column";
  navLinks.style.position = "absolute";
  navLinks.style.top = "64px";
  navLinks.style.left = "0";
  navLinks.style.right = "0";
  navLinks.style.background = "#111";
  navLinks.style.padding = "16px 24px 24px";
  navLinks.style.borderBottom = "1px solid #222";
  if (open) navLinks.removeAttribute("style");
});

// Smooth close nav on link click (mobile)
document.querySelectorAll(".nav-links a").forEach(link => {
  link.addEventListener("click", () => {
    if (window.innerWidth <= 900) navLinks.removeAttribute("style");
  });
});

// Animate stats on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll(".stat-card, .post-card").forEach(el => {
  el.style.opacity = "0";
  el.style.transform = "translateY(16px)";
  el.style.transition = "opacity 0.5s ease, transform 0.5s ease";
  observer.observe(el);
});
