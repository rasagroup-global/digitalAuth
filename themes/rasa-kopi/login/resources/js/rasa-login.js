/**
 * Rasa Account SSO — Interactive UI & Phone/Email Switcher
 * Transforms the Keycloak login screen to match the official Rasa mobile & web aesthetic:
 * - "Welcome to RASA" + "Login or Register your RASA account."
 * - Mode switcher: Phone (+49 / +62 / +43 / +41 / +31) or Email/Username
 * - Normalizes phone numbers on form submit so Keycloak matches user's phone username
 * - Circular Google social login button + Legal footer
 */
(function () {
  function initRasaLoginUI() {
    var titleEl = document.getElementById("kc-page-title");
    if (titleEl && !titleEl.querySelector(".rasa-accent")) {
      titleEl.innerHTML =
        'Welcome to <span class="rasa-accent">RASA</span>' +
        '<span class="rasa-subtitle">Login or Register your RASA account.</span>';
    }

    var usernameInput = document.getElementById("username");
    var loginForm = document.getElementById("kc-form-login");
    if (!usernameInput || !loginForm || document.getElementById("rasa-phone-prefix-wrap")) {
      return;
    }

    usernameInput.setAttribute("placeholder", "81XXXXXXX or name@email.com");

    // Create inline country code selector for phone numbers
    var controlSpan = usernameInput.closest(".pf-v5-c-form-control") || usernameInput.parentElement;
    if (controlSpan) {
      controlSpan.classList.add("rasa-identifier-control");

      var prefixWrap = document.createElement("div");
      prefixWrap.id = "rasa-phone-prefix-wrap";
      prefixWrap.className = "rasa-phone-prefix-wrap";
      prefixWrap.innerHTML =
        '<select id="rasa-country-code" aria-label="Country code" class="rasa-country-select">' +
        '  <option value="" selected>Email / +</option>' +
        '  <option value="+49">+49 DE</option>' +
        '  <option value="+62">+62 ID</option>' +
        '  <option value="+43">+43 AT</option>' +
        '  <option value="+41">+41 CH</option>' +
        '  <option value="+31">+31 NL</option>' +
        "</select>";

      controlSpan.insertBefore(prefixWrap, usernameInput);

      var countrySelect = document.getElementById("rasa-country-code");
      countrySelect.addEventListener("change", function () {
        if (countrySelect.value) {
          usernameInput.setAttribute("placeholder", "81XXXXXXX");
          usernameInput.focus();
        } else {
          usernameInput.setAttribute("placeholder", "81XXXXXXX or name@email.com");
        }
      });

      // Automatically normalize phone number on submit if user selected a country code or typed digits
      loginForm.addEventListener("submit", function () {
        var raw = (usernameInput.value || "").trim();
        if (!raw || raw.indexOf("@") !== -1) {
          return; // Email or normal username
        }
        var prefix = countrySelect.value || "";
        // If user typed digits only (phone login)
        if (/^[\d+\-\s()]+$/.test(raw)) {
          var digits = raw.replace(/[^\d+]/g, "");
          if (prefix && digits.indexOf("+") !== 0) {
            digits = digits.replace(/^0+/, "");
            usernameInput.value = prefix + digits;
          } else {
            usernameInput.value = digits;
          }
        }
      });
    }

    // Add legal footer inside main card if not present
    var mainCard = document.querySelector(".pf-v5-c-login__main");
    if (mainCard && !document.getElementById("rasa-legal-footer")) {
      var legalDiv = document.createElement("div");
      legalDiv.id = "rasa-legal-footer";
      legalDiv.className = "rasa-legal-footer";
      legalDiv.innerHTML =
        'By continuing, you agree with our <a href="https://rasakopi.coffee/agb/" target="_blank" rel="noopener">Terms of Services</a> and <a href="https://rasakopi.coffee/datenschutz/" target="_blank" rel="noopener">Privacy Policy</a>.';
      mainCard.appendChild(legalDiv);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initRasaLoginUI);
  } else {
    initRasaLoginUI();
  }
})();
