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

form.addEventListener("submit",(e)=>{

  let valid = true;

  function showError(id,message){

    const el = document.getElementById(id);

    if(el) el.textContent = message;

  }

  function clearErrors(){

    document.querySelectorAll("[id$='Error']").forEach(el=>{
      el.textContent = "";
    });

  }

  clearErrors();


  const title = document.getElementById("title").value.trim();
  const author = document.getElementById("author").value.trim();
  const description = document.getElementById("description").value.trim();
  const category = document.getElementById("category").value;

  if(!title){
    showError("titleError","Title required");
    valid=false;
  }

  if(!author){
    showError("authorError","Author required");
    valid=false;
  }

  if(!description){
    showError("descriptionError","Description required");
    valid=false;
  }

  if(!category){
    showError("categoryError","Select category");
    valid=false;
  }


  /* =========================
  VARIANT VALIDATION
  ========================= */

  getRows().forEach(row=>{

    const type = row.querySelector(".variantType");
    const price = row.querySelector(".variantPrice");
    const stock = row.querySelector(".variantStock");

    const typeError = row.querySelector(".variantTypeError");
    const priceError = row.querySelector(".variantPriceError");
    const stockError = row.querySelector(".variantStockError");

    if(!type.value){
      typeError.textContent="Select variant";
      valid=false;
    }

    if(!price.value || price.value <= 0){
      priceError.textContent="Invalid price";
      valid=false;
    }

    if(stock.value === "" || stock.value < 0){
      stockError.textContent="Invalid stock";
      valid=false;
    }

  });


  if(checkDuplicateVariants()) valid=false;

  if(!valid){
    e.preventDefault();
  }

});

});


/* =========================
IMAGE PREVIEW
========================= */

function handlePreview(inputId, previewId){

  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);

  if(!input || !preview) return;

  input.addEventListener("change",()=>{

    const file = input.files[0];

    if(!file) return;

    const reader = new FileReader();

    reader.onload = e => {

      preview.src = e.target.result;
      preview.classList.remove("hidden");

    };

    reader.readAsDataURL(file);

  });

}

handlePreview("coverImage","coverPreview");
handlePreview("sideImage","sidePreview");
handlePreview("backImage","backPreview");