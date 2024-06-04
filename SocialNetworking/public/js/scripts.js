// Select the settings menu element
var settingsmenu = document.querySelector(".settings-menu");

// Function to toggle the visibility of the settings menu
function settingsMenuToggle() {
  // Toggle the class that changes the height of the settings menu
  settingsmenu.classList.toggle("settings-menu-height");
}

// Select the dark mode toggle button element
var darkBtn = document.getElementById("dark-btn");

// Event listener for the dark mode toggle button
darkBtn.onclick = function () {
  // Toggle the class to indicate the button is "on"
  darkBtn.classList.toggle("dark-btn-on");
  // Toggle the class on the body to switch between light and dark themes
  document.body.classList.toggle("dark-theme");

  // Check the current theme stored in localStorage and update it
  if (localStorage.getItem("theme") == "light") {
    // If the current theme is light, set it to dark
    localStorage.setItem("theme", "dark");
  } else {
    // If the current theme is not light (i.e., dark), set it to light
    localStorage.setItem("theme", "light");
  }
};

// On page load, check the stored theme in localStorage and apply it
if (localStorage.getItem("theme") == "light") {
  // If the stored theme is light, ensure the dark mode button is not "on" and the body does not have the dark theme class
  darkBtn.classList.remove("dark-btn-on");
  document.body.classList.remove("dark-theme");
} else if (localStorage.getItem("theme") == "dark") {
  // If the stored theme is dark, ensure the dark mode button is "on" and the body has the dark theme class
  darkBtn.classList.add("dark-btn-on");
  document.body.classList.add("dark-theme");
} else {
  // If no theme is stored, set the default theme to light
  localStorage.setItem("theme", "light");
}
