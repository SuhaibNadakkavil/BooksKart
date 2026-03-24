document.addEventListener("DOMContentLoaded", () => {

const form = document.getElementById("editProductForm");
const addVariantBtn = document.getElementById("addVariantBtn");
const variantContainer = document.getElementById("variantContainer");
const duplicateError = document.getElementById("variantDuplicateError");


/* =========================
UTILITY FUNCTIONS
========================= */

function getRows(){
  return variantContainer.querySelectorAll(".variantRow");
}

function updateRemoveButtons(){

  const rows = getRows();

  rows.forEach(row => {

    const btn = row.querySelector(".removeVariantBtn");

    if(rows.length === 1){
      btn.disabled = true;
      btn.classList.add("opacity-40","cursor-not-allowed");
    }else{
      btn.disabled = false;
      btn.classList.remove("opacity-40","cursor-not-allowed");
    }

  });

}


function checkDuplicateVariants(){

  const selects = variantContainer.querySelectorAll(".variantType");
  const values = [];

  selects.forEach(s=>{
    if(s.value) values.push(s.value);
  });

  const duplicates = values.filter((v,i,a)=>a.indexOf(v)!==i);

  if(duplicates.length){

    duplicateError.textContent = "Same variant cannot be selected twice";
    duplicateError.classList.remove("hidden");
    return true;

  }

  duplicateError.textContent = "";
  duplicateError.classList.add("hidden");

  return false;

}



/* =========================
ADD VARIANT
========================= */

addVariantBtn.addEventListener("click", () => {

  const rows = getRows();

  if(rows.length >= 2){

    duplicateError.textContent = "Only two variants allowed";
    duplicateError.classList.remove("hidden");
    return;

  }

  const template = rows[0].cloneNode(true);

  template.querySelectorAll("input").forEach(i=> i.value="");
  template.querySelectorAll("select").forEach(s=> s.value="");
  template.querySelectorAll("p").forEach(p=> p.textContent="");

  variantContainer.appendChild(template);

  updateRemoveButtons();

});


/* =========================
REMOVE VARIANT
========================= */

variantContainer.addEventListener("click",(e)=>{

  if(!e.target.classList.contains("removeVariantBtn")) return;

  const rows = getRows();

  if(rows.length === 1) return;

  e.target.closest(".variantRow").remove();

  updateRemoveButtons();
  checkDuplicateVariants();

});


/* =========================
DUPLICATE CHECK
========================= */

variantContainer.addEventListener("change",(e)=>{

  if(!e.target.classList.contains("variantType")) return;

  checkDuplicateVariants();

});


/* =========================
INITIAL STATE
========================= */

updateRemoveButtons();
checkDuplicateVariants();



/* =========================
FORM VALIDATION
========================= */

form.addEventListener("submit", async (e) => {

  e.preventDefault(); // 🚫 stop reload

  let valid = true;

  const submitBtn = form.querySelector("button[type='submit']");

  function showError(id, message) {
    const el = document.getElementById(id);
    if (el) el.textContent = message;
  }

  function clearErrors() {
    document.querySelectorAll("[id$='Error']").forEach(el => {
      el.textContent = "";
    });
  }

  clearErrors();

  /* =========================
     BASIC VALIDATION
  ========================= */

  const title = document.getElementById("title").value.trim();
  const author = document.getElementById("author").value.trim();
  const description = document.getElementById("description").value.trim();
  const category = document.getElementById("category").value;

  if (!title) {
    showError("titleError", "Title required");
    valid = false;
  }

  if (!author) {
    showError("authorError", "Author required");
    valid = false;
  }

  if (!description) {
    showError("descriptionError", "Description required");
    valid = false;
  }

  if (!category) {
    showError("categoryError", "Select category");
    valid = false;
  }

  /* =========================
     VARIANT VALIDATION
  ========================= */

  getRows().forEach(row => {

    const type = row.querySelector(".variantType");
    const price = row.querySelector(".variantPrice");
    const stock = row.querySelector(".variantStock");

    const typeError = row.querySelector(".variantTypeError");
    const priceError = row.querySelector(".variantPriceError");
    const stockError = row.querySelector(".variantStockError");

    if (!type.value) {
      typeError.textContent = "Select variant";
      valid = false;
    }

    if (!price.value || price.value <= 0) {
      priceError.textContent = "Invalid price";
      valid = false;
    }

    if (stock.value === "" || stock.value < 0) {
      stockError.textContent = "Invalid stock";
      valid = false;
    }

  });

  if (checkDuplicateVariants()) valid = false;

  /* =========================
     IMAGE VALIDATION (OPTIONAL)
  ========================= */

  const cover = document.getElementById("coverImage").files[0];
  const side = document.getElementById("sideImage").files[0];
  const back = document.getElementById("backImage").files[0];

  function validateImage(file, errorId) {
    if (!file) return true;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      showError(errorId, "Invalid image type");
      return false;
    }

    return true;
  }

  if (!validateImage(cover, "coverError")) valid = false;
  if (!validateImage(side, "sideError")) valid = false;
  if (!validateImage(back, "backError")) valid = false;

  if (!valid) return;

  /* =========================
     FORM DATA BUILD
  ========================= */

  const formData = new FormData();

  formData.append("title", title);
  formData.append("author", author);
  formData.append("description", description);
  formData.append("category", category);

  // Variants
  getRows().forEach(row => {
    formData.append("variantType", row.querySelector(".variantType").value);
    formData.append("regularPrice", row.querySelector(".variantPrice").value);
    formData.append("stock", row.querySelector(".variantStock").value);
  });

  // Optional images
  if (cover) formData.append("coverImage", cover);
  if (side) formData.append("sideImage", side);
  if (back) formData.append("backImage", back);

  /* =========================
     API CALL
  ========================= */

  try {

    submitBtn.disabled = true;
    submitBtn.textContent = "Updating...";

    const response = await fetch(form.action, {
      method: "POST", // or PUT if configured
      body: formData
    });

    const data = await response.json();

    /* =========================
       HANDLE RESPONSE
    ========================= */

    if (!data.success) {

      // Field errors
      if (data.errors) {
        Object.entries(data.errors).forEach(([key, msg]) => {
          showError(`${key}Error`, msg);
        });
      }

      // Global error
      if (data.message) {
        showToast(data.message, "error");
      }

      return;
    }

    /* =========================
       SUCCESS
    ========================= */

    showToast(data.message || "Product updated", "success");

    setTimeout(() => {
      if (data.redirect) {
        window.location.href = data.redirect;
      }
    }, 1000);

  } catch (err) {

    showToast("Something went wrong", "error");

  } finally {

    submitBtn.disabled = false;
    submitBtn.textContent = "Update Product";

  }

});


const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const TARGET_WIDTH = 1200;
const TARGET_HEIGHT = 1600;

let cropper;
let currentInput = null;
let currentPreview = null;

function openCropModal(file, input, preview, errorEl) {

  if (!ALLOWED_TYPES.includes(file.type)) {
    errorEl.textContent = "Only JPG, PNG, WEBP allowed";
    return;
  }

  currentInput = input;
  currentPreview = preview;

  const modal = document.getElementById("cropModal");
  const image = document.getElementById("cropImage");

  const reader = new FileReader();

  reader.onload = e => {

    image.src = e.target.result;

    modal.classList.remove("hidden");
    modal.classList.add("flex");

    image.onload = () => {

      if (cropper) {
        cropper.destroy();
        cropper = null;
      }

      cropper = new Cropper(image, {
        aspectRatio: 3 / 4,
        viewMode: 1,
        autoCropArea: 1,
        responsive: true,
        background: false
      });
      
    };

  };

  reader.readAsDataURL(file);
}

document.getElementById("confirmCrop").addEventListener("click", () => {

  if (!cropper) return;

  const canvas = cropper.getCroppedCanvas({
    width: 1200,
    height: 1600
  });

  canvas.toBlob(blob => {

    const newFile = new File([blob], "cropped.jpg", {
      type: "image/jpeg"
    });

    const dt = new DataTransfer();
    dt.items.add(newFile);
    currentInput.files = dt.files;

    // Preview
    const reader = new FileReader();
    reader.onload = e => {
      currentPreview.src = e.target.result;
      currentPreview.classList.remove("hidden");
    };

    reader.readAsDataURL(newFile);

    closeCropModal();

  }, "image/jpeg", 0.9);

});

function closeCropModal() {

  const modal = document.getElementById("cropModal");

  modal.classList.add("hidden");
  modal.classList.remove("flex");

  if (cropper) {
    cropper.destroy();
    cropper = null;
  }
}

document.getElementById("cancelCrop").addEventListener("click", () => {

  if (currentInput) {
    currentInput.value = "";
  }

  closeCropModal();
});

/* =========================
IMAGE PREVIEW
========================= */

function handlePreview(inputId, previewId, errorId) {

  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  const errorEl = document.getElementById(errorId);

  input.addEventListener("change", () => {

    const file = input.files[0];
    if (!file) return;

    errorEl.textContent = "";

    openCropModal(file, input, preview, errorEl);

  });
}

handlePreview("coverImage", "coverPreview", "coverError");
handlePreview("sideImage", "sidePreview", "sideError");
handlePreview("backImage", "backPreview", "backError");

});