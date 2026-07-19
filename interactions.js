(function () {
  "use strict";

  const checkoutUrl = document.documentElement.dataset.checkoutUrl || "";
  const order = document.querySelector(".container-order-form-two-step");
  const body = order && order.querySelector(".form-body");
  const submit = order && order.querySelector(".form-btn");
  const terms = order && order.querySelector("#terms-conditions-input");
  const fields = order ? Array.from(order.querySelectorAll("input[name], select[name]")) : [];

  function scrollToOrder() {
    if (!order) return;
    order.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(function () { if (fields[0]) fields[0].focus({ preventScroll: true }); }, 650);
  }

  document.querySelectorAll("button[id^='button-'][id$='_btn']").forEach(function (button) {
    button.type = "button";
    button.addEventListener("click", scrollToOrder);
  });

  function setMessage(text, error) {
    if (!body) return;
    let message = body.querySelector(".restored-form-message");
    if (!message) {
      message = document.createElement("p");
      message.className = "restored-form-message";
      message.setAttribute("role", "status");
      message.setAttribute("aria-live", "polite");
      body.insertBefore(message, body.querySelector(".order-form-footer"));
    }
    message.textContent = text;
    message.style.cssText = "margin:10px 0 0;text-align:center;font-size:13px;line-height:1.4;color:" + (error ? "#9f2f22" : "#1b6b3a");
  }

  function fieldIsValid(field) {
    const value = field.value.trim();
    if (!value) return false;
    if (field.name === "email") return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    if (field.name === "phone") return value.replace(/\D/g, "").length >= 8;
    return true;
  }

  function validate(showErrors) {
    let valid = fields.length > 0;
    fields.forEach(function (field) {
      const fieldValid = fieldIsValid(field);
      valid = valid && fieldValid;
      field.setAttribute("aria-invalid", String(!fieldValid));
      if (showErrors || field.dataset.touched) field.style.borderColor = fieldValid ? "" : "#b74432";
    });
    valid = valid && Boolean(terms && terms.checked);
    if (submit) {
      submit.disabled = !valid;
      submit.classList.toggle("disabled", !valid);
      submit.setAttribute("aria-disabled", String(!valid));
    }
    return valid;
  }

  fields.forEach(function (field) {
    field.addEventListener("blur", function () { field.dataset.touched = "true"; validate(false); });
    field.addEventListener("input", function () { validate(false); });
    field.addEventListener("change", function () { validate(false); });
  });
  if (terms) terms.addEventListener("change", function () { validate(false); });

  if (submit) {
    submit.type = "button";
    submit.addEventListener("click", function () {
      if (!validate(true)) {
        setMessage("Please complete every field and accept the terms to continue.", true);
        const invalid = fields.find(function (field) { return !fieldIsValid(field); });
        if (invalid) invalid.focus();
        return;
      }
      if (!checkoutUrl) {
        setMessage("Your details are valid. The payment link still needs to be configured.", true);
        return;
      }
      const target = new URL(checkoutUrl, location.href);
      fields.forEach(function (field) { target.searchParams.set(field.name, field.value.trim()); });
      location.assign(target.toString());
    });
  }
  validate(false);

  const faqItems = Array.from(document.querySelectorAll(".hl-faq-child"));
  function closeFaq(item) {
    const heading = item.querySelector(".hl-faq-child-heading");
    const panel = item.querySelector(".hl-faq-child-panel");
    if (!heading || !panel) return;
    heading.setAttribute("aria-expanded", "false");
    panel.setAttribute("aria-hidden", "true");
    panel.style.height = "0px";
    panel.style.opacity = "0";
    panel.style.paddingTop = "0px";
    panel.style.paddingBottom = "0px";
    item.classList.remove("active");
  }

  faqItems.forEach(function (item, index) {
    const heading = item.querySelector(".hl-faq-child-heading");
    const panel = item.querySelector(".hl-faq-child-panel");
    if (!heading || !panel) return;
    panel.id = "restored-faq-panel-" + index;
    heading.setAttribute("role", "button");
    heading.setAttribute("tabindex", "0");
    heading.setAttribute("aria-controls", panel.id);
    panel.style.overflow = "hidden";
    panel.style.transition = "height .3s ease,opacity .25s ease,padding .3s ease";
    closeFaq(item);

    function toggle() {
      const opening = heading.getAttribute("aria-expanded") !== "true";
      faqItems.forEach(closeFaq);
      if (!opening) return;
      heading.setAttribute("aria-expanded", "true");
      panel.setAttribute("aria-hidden", "false");
      panel.style.paddingTop = "15px";
      panel.style.paddingBottom = "15px";
      panel.style.opacity = "1";
      panel.style.height = panel.scrollHeight + 30 + "px";
      item.classList.add("active");
    }
    heading.addEventListener("click", toggle);
    heading.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); toggle(); }
    });
  });

  const steps = Array.from(document.querySelectorAll(".willakane-step-item"));
  const progress = document.querySelector("#willakane-glowing-line");
  function selectStep(index) {
    steps.forEach(function (step, stepIndex) {
      step.classList.toggle("active-step", stepIndex === index);
      step.setAttribute("aria-current", stepIndex === index ? "step" : "false");
    });
    if (progress && steps.length > 1) {
      progress.style.width = 10 + (70 * index) / (steps.length - 1) + "%";
      progress.style.transition = "width .45s cubic-bezier(.16,1,.3,1)";
    }
  }
  steps.forEach(function (step, index) {
    step.setAttribute("role", "button");
    step.setAttribute("tabindex", "0");
    step.addEventListener("click", function () { selectStep(index); });
    step.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); selectStep(index); }
    });
  });
  if (steps.length) selectStep(0);

  const minutes = document.querySelector(".wadesfarm-bot-mins-val");
  const seconds = document.querySelector(".wadesfarm-bot-secs-val");
  if (minutes && seconds) {
    const initialSeconds = Math.max(0, (parseInt(minutes.textContent, 10) || 0) * 60 + (parseInt(seconds.textContent, 10) || 0));
    const storageKey = "maya-lin-offer-deadline";
    let deadline = Number(sessionStorage.getItem(storageKey));
    if (!deadline || deadline < Date.now()) {
      deadline = Date.now() + initialSeconds * 1000;
      sessionStorage.setItem(storageKey, String(deadline));
    }
    function updateTimer() {
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      minutes.textContent = String(Math.floor(remaining / 60)).padStart(2, "0");
      seconds.textContent = String(remaining % 60).padStart(2, "0");
      if (!remaining) clearInterval(timerInterval);
    }
    const timerInterval = setInterval(updateTimer, 1000);
    updateTimer();
  }
})();
