(() => {
  const form = document.getElementById("contactForm");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const formats = data.getAll("printType");
    const body = [
      "Name: " + data.get("name"),
      "Email: " + data.get("email"),
      "Print options: " + (formats.length ? formats.join(", ") : "Not specified"),
      "Preferred size: " + (String(data.get("size") || "").trim() || "Not specified"),
      "",
      String(data.get("message") || "").trim(),
    ].join("\n");

    window.location.href = "mailto:ChaoticColorDesigns@gmail.com"
      + "?subject=" + encodeURIComponent("Artwork print inquiry")
      + "&body=" + encodeURIComponent(body);
  });
})();
