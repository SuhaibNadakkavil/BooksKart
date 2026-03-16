import * as productRepo from '../../repositories/user/product.repository.js'

// Final price calculation logic
const calculateSalePrice = (price, offer) => {

  if (!offer) return price;

  if (offer.type === "percentage") {
    return Math.max(1, Math.round(price - (price * offer.value) / 100));
  }

  if (offer.type === "flat") {
    return Math.max(1, price - offer.value);
  }

  return price;
};


export const getNewArrivalProductsService = async () => {

  const products = await productRepo.findNewArrivalProducts(4);

  for (const product of products) {

    const productOffer = product.productOffer;
    const categoryOffer = product.category?.offer;

    const appliedOffer = productOffer || categoryOffer || null;

    for (const variant of product.variants) {

      variant.salePrice = calculateSalePrice(
        variant.regularPrice,
        appliedOffer
      );

    }

  }

  return products;

};


/* =================================
   PRODUCT LISTING SERVICE
================================= */

export const getShopProductsService = async (query) => {

  const page = parseInt(query.page) || 1;
  const limit = 6;
  const skip = (page - 1) * limit;

  /* =================================
     BASE FILTER
  ================================= */

  const filter = {
    isActive: true,
    isDeleted: false
  };


  /* =================================
     SEARCH
  ================================= */

  if (query.search && query.search.trim() !== "") {

    const regex = new RegExp(query.search.trim(), "i");

    filter.$or = [
      { title: regex },
      { author: regex }
    ];

  }

  /* =================================
     PRICE FILTER
  ================================= */

  if (query.price) {

    if (query.price === "under200") {
      filter["variants.regularPrice"] = { $lt: 200 };
    }

    if (query.price === "200-250") {
      filter["variants.regularPrice"] = { $gte: 200, $lte: 250 };
    }

    if (query.price === "250-300") {
      filter["variants.regularPrice"] = { $gte: 250, $lte: 300 };
    }

    if (query.price === "300plus") {
      filter["variants.regularPrice"] = { $gt: 300 };
    }

  }


  /* =================================
     SORTING
  ================================= */

  let sort = { createdAt: -1 };

  if (query.sort === "priceLow") sort = { "variants.regularPrice": 1 };
  if (query.sort === "priceHigh") sort = { "variants.regularPrice": -1 };
  if (query.sort === "az") sort = { title: 1 };
  if (query.sort === "za") sort = { title: -1 };


  /* =================================
     FETCH PRODUCTS
  ================================= */

  const { products, totalProducts } = await productRepo.findShopProducts({
    filter,
    sort,
    skip,
    limit,
    categorySlug: query.category
  });


  /* =================================
     APPLY OFFERS
  ================================= */

  for (const product of products) {

    const productOffer = product.productOffer;
    const categoryOffer = product.category?.offer;

    const appliedOffer = productOffer || categoryOffer || null;

    for (const variant of product.variants) {

      variant.salePrice = calculateSalePrice(
        variant.regularPrice,
        appliedOffer
      );

    }

  }

    const categoriesMap = new Map();

    for (const product of products) {
        const cat = product.category;
        if (cat && !categoriesMap.has(cat.slug)) {
            categoriesMap.set(cat.slug, {
                name: cat.name,
                slug: cat.slug
            });
        }
    }

    const categories = Array.from(categoriesMap.values());


  /* =================================
     PAGINATION
  ================================= */

  const totalPages = Math.ceil(totalProducts / limit);

  return {
    products,
    categories,
    totalProducts,
    page,
    totalPages
  };

};


/* =================================
   PRODUCT DETAILS SERVICE
================================= */

export const getProductDetailsService = async (slug) => {

  /* ==============================
     FETCH PRODUCT
  ============================== */

  const product = await productRepo.findProductDetailsBySlug(slug);

  if (!product) {
    return null;
  }

  /* ==============================
     VALIDATE PRODUCT STATUS
  ============================== */

  if (!product.isActive) {
    return { blocked: true };
  }

  /* ==============================
     APPLY OFFERS
  ============================== */

  const productOffer = product.productOffer;
  const categoryOffer = product.category?.offer;

  const appliedOffer = productOffer || categoryOffer || null;

  for (const variant of product.variants) {

    variant.salePrice = calculateSalePrice(
      variant.regularPrice,
      appliedOffer
    );

  }

  /* ==============================
     RELATED PRODUCTS
  ============================== */

  const relatedProducts = await productRepo.findRelatedProducts({
    categoryId: product.category._id,
    productId: product._id,
    limit: 4
  });

  for (const item of relatedProducts) {

    const productOffer = item.productOffer;
    const categoryOffer = item.category?.offer;

    const appliedOffer = productOffer || categoryOffer || null;

    for (const variant of item.variants) {

      variant.salePrice = calculateSalePrice(
        variant.regularPrice,
        appliedOffer
      );

    }

  }

  return {
    product,
    relatedProducts
  };

};