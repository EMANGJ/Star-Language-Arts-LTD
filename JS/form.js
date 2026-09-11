/* =========================================================
   EFFECTIVE COMMUNICATION & PUBLIC SPEAKING REGISTRATION
   Frontend controller

   BACKEND CONNECTION:
   When your backend is ready, keep:
      FORM_ENDPOINT = "/.netlify/functions/register"

   The form is submitted as multipart/form-data so the receipt
   file can be sent together with the other fields.
   ========================================================= */

const FORM_ENDPOINT = "/.netlify/functions/register";

const form = document.getElementById("registrationForm");
const steps = [...document.querySelectorAll(".form-step")];
const indicators = [...document.querySelectorAll(".progress-step")];
const progressFill = document.getElementById("progressFill");

const successScreen = document.getElementById("successScreen");
const successName = document.getElementById("successName");

const submitBtn = document.getElementById("submitBtn");
const btnText = submitBtn.querySelector(".btn-text");
const btnSpinner = submitBtn.querySelector(".btn-spinner");
const submitStatus = document.getElementById("submitStatus");

const receiptInput = document.getElementById("receipt");
const filePreview = document.getElementById("filePreview");
const fileName = document.getElementById("fileName");
const fileSize = document.getElementById("fileSize");
const removeFile = document.getElementById("removeFile");

const otherImprovementCheckbox = document.getElementById("improvementOtherCheckbox");
const otherImprovementWrap = document.getElementById("improvementOtherWrap");

let currentStep = 1;

const MAX_FILE_SIZE = 4 * 1024 * 1024;
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf"
];

/* ---------------------------------------------------------
   Helpers
--------------------------------------------------------- */

function getStep(stepNumber) {
  return steps.find(step => Number(step.dataset.step) === stepNumber);
}

function setCurrentStep(stepNumber) {
  currentStep = stepNumber;

  steps.forEach(step => {
    step.classList.toggle("active", Number(step.dataset.step) === stepNumber);
  });

  indicators.forEach(indicator => {
    const step = Number(indicator.dataset.stepIndicator);

    indicator.classList.toggle("active", step === stepNumber);
    indicator.classList.toggle("complete", step < stepNumber);
  });

  const percent = ((stepNumber - 1) / 2) * 100;
  progressFill.style.width = `${percent}%`;

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function showFieldError(inputId, message) {
  const field = document.getElementById(inputId)?.closest(".field");
  const error = document.querySelector(`[data-error-for="${inputId}"]`);

  if (field) field.classList.toggle("invalid", Boolean(message));
  if (error) error.textContent = message || "";
}

function clearGroupError(groupName) {
  const group = document.querySelector(`[data-error-group="${groupName}"]`);
  const wrapper = group?.closest(".choice-group");

  if (group) group.textContent = "";
  if (wrapper) wrapper.classList.remove("invalid");
}

function showGroupError(groupName, message) {
  const group = document.querySelector(`[data-error-group="${groupName}"]`);
  const wrapper = group?.closest(".choice-group");

  if (group) group.textContent = message;
  if (wrapper) wrapper.classList.add("invalid");
}

function clearStepErrors(stepNumber) {
  const step = getStep(stepNumber);

  if (!step) return;

  step.querySelectorAll(".field").forEach(field => field.classList.remove("invalid"));
  step.querySelectorAll(".field-error").forEach(error => error.textContent = "");
  step.querySelectorAll(".choice-group").forEach(group => group.classList.remove("invalid"));
}

function getSelectedValue(name) {
  return form.querySelector(`input[name="${name}"]:checked`)?.value || "";
}

function getSelectedCheckboxValues(name) {
  return [...form.querySelectorAll(`input[name="${name}"]:checked`)].map(input => input.value);
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isValidPhone(value) {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

function firstNameFrom(fullName) {
  return fullName.trim().split(/\s+/)[0] || "there";
}

function setSubmitting(isSubmitting) {
  submitBtn.disabled = isSubmitting;
  btnSpinner.classList.toggle("hidden", !isSubmitting);
  btnText.textContent = isSubmitting ? "Submitting..." : "Submit Registration";
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ---------------------------------------------------------
   Step 1 validation
--------------------------------------------------------- */

function validateStep1() {
  clearStepErrors(1);

  let valid = true;

  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const whatsapp = document.getElementById("whatsapp").value.trim();

  if (!fullName) {
    showFieldError("fullName", "Please enter your full name.");
    valid = false;
  } else if (fullName.length < 2) {
    showFieldError("fullName", "Please enter a valid name.");
    valid = false;
  }

  if (!email) {
    showFieldError("email", "Please enter your email address.");
    valid = false;
  } else if (!isValidEmail(email)) {
    showFieldError("email", "Please enter a valid email address.");
    valid = false;
  }

  if (!whatsapp) {
    showFieldError("whatsapp", "Please enter your WhatsApp number.");
    valid = false;
  } else if (!isValidPhone(whatsapp)) {
    showFieldError("whatsapp", "Please enter a valid phone number.");
    valid = false;
  }

  return valid;
}

/* ---------------------------------------------------------
   Step 2 validation
--------------------------------------------------------- */

function validateStep2() {
  clearStepErrors(2);

  let valid = true;

  const attendance = getSelectedValue("attendance");
  const profileType = getSelectedValue("profileType");
  const improvements = getSelectedCheckboxValues("improvements[]");
  const biggestChallenge = document.getElementById("biggestChallenge").value.trim();
  const comfortLevel = getSelectedValue("comfortLevel");
  const formalTraining = getSelectedValue("formalTraining");
  const expectedOutcome = document.getElementById("expectedOutcome").value.trim();
  const source = getSelectedValue("source");

  if (!attendance) {
    showGroupError("attendance", "Please select a class option.");
    valid = false;
  }

  if (!profileType) {
    showGroupError("profileType", "Please select the option that best describes you.");
    valid = false;
  }

  if (improvements.length === 0) {
    showGroupError("improvements", "Please select at least one area you want to improve.");
    valid = false;
  }

  if (!biggestChallenge) {
    showFieldError("biggestChallenge", "Please tell us about your biggest challenge.");
    valid = false;
  }

  if (!comfortLevel) {
    showGroupError("comfortLevel", "Please choose your comfort level.");
    valid = false;
  }

  if (!formalTraining) {
    showGroupError("formalTraining", "Please choose Yes or No.");
    valid = false;
  }

  if (!expectedOutcome) {
    showFieldError("expectedOutcome", "Please tell us what you hope to achieve.");
    valid = false;
  }

  if (!source) {
    showGroupError("source", "Please tell us how you heard about the classes.");
    valid = false;
  }

  if (otherImprovementCheckbox.checked) {
    const otherText = document.getElementById("improvementOther").value.trim();

    if (!otherText) {
      document.getElementById("improvementOther").focus();
      document.getElementById("improvementOther").style.borderColor = "var(--danger)";
      valid = false;
    }
  }

  return valid;
}

/* ---------------------------------------------------------
   Step 3 validation
--------------------------------------------------------- */

function validateStep3() {
  clearStepErrors(3);
  submitStatus.textContent = "";

  let valid = true;

  const reference = document.getElementById("paymentReference").value.trim();
  const paymentDate = document.getElementById("paymentDate").value;

  if (!receiptInput.files.length) {
    showFieldError("receipt", "Please upload your payment receipt.");
    valid = false;
  } else {
    const file = receiptInput.files[0];

    if (!ALLOWED_TYPES.includes(file.type)) {
      showFieldError("receipt", "Please upload a JPG, PNG or PDF file.");
      valid = false;
    } else if (file.size > MAX_FILE_SIZE) {
      showFieldError("receipt", "Receipt file must be 10 MB or smaller.");
      valid = false;
    }
  }

  if (!reference) {
    showFieldError("paymentReference", "Please enter your transfer/payment reference.");
    valid = false;
  }

  if (!paymentDate) {
    showFieldError("paymentDate", "Please select the payment date.");
    valid = false;
  }

  return valid;
}

/* ---------------------------------------------------------
   File preview
--------------------------------------------------------- */

receiptInput.addEventListener("change", () => {
  const file = receiptInput.files[0];

  if (!file) {
    filePreview.classList.add("hidden");
    return;
  }

  fileName.textContent = file.name;
  fileSize.textContent = formatFileSize(file.size);
  filePreview.classList.remove("hidden");

  // Remove invalid file immediately.
  if (!ALLOWED_TYPES.includes(file.type) || file.size > MAX_FILE_SIZE) {
    showFieldError(
      "receipt",
      file.size > MAX_FILE_SIZE
        ? "Receipt file must be 10 MB or smaller."
        : "Please upload a JPG, PNG or PDF file."
    );
  } else {
    showFieldError("receipt", "");
  }
});

removeFile.addEventListener("click", () => {
  receiptInput.value = "";
  filePreview.classList.add("hidden");
  showFieldError("receipt", "");
});

/* ---------------------------------------------------------
   Conditional "Other" field
--------------------------------------------------------- */

otherImprovementCheckbox.addEventListener("change", () => {
  otherImprovementWrap.classList.toggle("hidden", !otherImprovementCheckbox.checked);

  if (!otherImprovementCheckbox.checked) {
    document.getElementById("improvementOther").value = "";
    document.getElementById("improvementOther").style.borderColor = "";
  }
});

/* ---------------------------------------------------------
   Navigation buttons
--------------------------------------------------------- */

document.querySelectorAll(".next-btn").forEach(button => {
  button.addEventListener("click", () => {
    const next = Number(button.dataset.next);

    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;

    setCurrentStep(next);
  });
});

document.querySelectorAll(".back-btn").forEach(button => {
  button.addEventListener("click", () => {
    const back = Number(button.dataset.back);
    setCurrentStep(back);
    clearStepErrors(back);
  });
});

/* ---------------------------------------------------------
   Submission
--------------------------------------------------------- */

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!validateStep1()) {
    setCurrentStep(1);
    return;
  }

  if (!validateStep2()) {
    setCurrentStep(2);
    return;
  }

  if (!validateStep3()) {
    return;
  }

  setSubmitting(true);
  submitStatus.textContent = "";

  const formData = new FormData(form);

  // Useful metadata for your backend.
  formData.append("program", "Effective Communication & Public Speaking");
  formData.append("programFee", "25000");
  formData.append("submittedAt", new Date().toISOString());

  try {
    /*
      Your future backend should accept:
      POST /.netlify/functions/register

      Content-Type must remain multipart/form-data.
      Do NOT manually set the Content-Type header when using FormData.
    */
    const response = await fetch(FORM_ENDPOINT, {
      method: "POST",
      body: formData
    });

    let result = {};

    try {
      result = await response.json();
    } catch {
      // Backend may return an empty/non-JSON response.
    }

    if (!response.ok || result.success === false) {
      throw new Error(result.message || "We couldn't submit your registration right now.");
    }

    showSuccessScreen();
  } catch (error) {
    console.error("Registration submission error:", error);

    submitStatus.textContent =
      error.message ||
      "Something went wrong. Please check your connection and try again.";

    // Helpful for local development if the backend isn't running yet.
    // Remove this development-only shortcut before production.
    const isLocalDemo =
      window.location.protocol === "file:" ||
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    if (isLocalDemo) {
      submitStatus.textContent =
        "Backend is not connected yet. The form is ready for the backend connection. " +
        "For a visual test only, you can enable DEMO_MODE in script.js.";

      if (window.DEMO_MODE === true) {
        showSuccessScreen();
      }
    }
  } finally {
    setSubmitting(false);
  }
});

/* ---------------------------------------------------------
   Success
--------------------------------------------------------- */

function showSuccessScreen() {
  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();

  successName.textContent = firstNameFrom(fullName);

  form.classList.add("hidden");
  document.querySelector(".progress-wrap").classList.add("hidden");
  successScreen.classList.add("show");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

/*
  OPTIONAL LOCAL VISUAL TEST ONLY

  When you're testing the design before the backend exists:
      window.DEMO_MODE = true;

  Before sending the real site live, set it back to:
      window.DEMO_MODE = false;
*/
window.DEMO_MODE = false;
