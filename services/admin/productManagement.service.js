import * as productRepo from "../../repositories/user/product.repository.js";
import { createSlug } from "../../utils/slugify.js";
import cloudinary from "../../config/cloudinary.js";
import { deleteCloudinaryImage } from "../../utils/cloudinary.util.js";

const uploadImage = async (buffer, name) => {

    return new Promise((resolve, reject) => {

        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "bookskart/products",
                public_id: `${Date.now()}-${name}`,
                transformation: [
                    {
                        width: 1200,
                        height: 1600,
                        crop: "fill",
                        gravity: "auto"
                    }
                ]
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result.secure_url);
            }
        );

        stream.end(buffer);

    });

};


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


export const getProductsService = async (query) => {

    const page = parseInt(query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    const filter = {
        isDeleted: false
    };

    /* =========================
    SEARCH
    ========================= */

    if (query.search && query.search.trim() !== "") {

        const regex = new RegExp(query.search.trim(), "i");

        filter.$or = [
            { title: regex },
            { author: regex }
        ];

    }


    /* =========================
    STATUS FILTER
    ========================= */

    if (query.status === "active") filter.isActive = true;
    if (query.status === "inactive") filter.isActive = false;


    /* =========================
    SORT
    ========================= */

    let sort = { createdAt: -1 };

    if (query.sort === "old") sort = { createdAt: 1 };
    if (query.sort === "az") sort = { title: 1 };
    if (query.sort === "za") sort = { title: -1 };
    if (query.sort === "priceLow") sort = { "variants.regularPrice": 1 };
    if (query.sort === "priceHigh") sort = { "variants.regularPrice": -1 };


    /* =========================
    FETCH PRODUCTS
    ========================= */

    const { products, totalProducts } = await productRepo.findProductsWithCategoryFilter({
        filter,
        sort,
        skip,
        limit
    });


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


    /* =========================
    PAGINATION
    ========================= */

    const totalPages = Math.ceil(totalProducts / limit);

    return {
        products,
        totalProducts,
        page,
        totalPages
    };

};



export const addProductService = async (data, files) => {

    if (!files.coverImage || !files.sideImage || !files.backImage) {

        const error = new Error("All three product images are required");
        error.type = "GLOBAL";
        throw error;

    }
    
    const slug = createSlug(data.title);

    const existingProduct = await productRepo.findProductBySlug(slug);

    if (existingProduct) {
        const error = new Error("Product already exists");
        error.type = "GLOBAL";
        throw error;
    }

    const cover = await uploadImage(files.coverImage[0].buffer, "cover");
    const side = await uploadImage(files.sideImage[0].buffer, "side");
    const back = await uploadImage(files.backImage[0].buffer, "back");

    const images = {
        cover,
        side,
        back
    };

    const product = await productRepo.createProduct({
        title: data.title,
        slug,
        author: data.author,
        description: data.description,
        category: data.category,
        images,
        variants: data.variants
    });

    return product;

};


export const updateProductService = async (id, data, files, existingProduct) => {

  let images = { ...existingProduct.images };

  /* =========================
     IMAGE UPDATES (SAFE CHECK)
  ========================= */

  if (files?.coverImage?.[0]) {
    await deleteCloudinaryImage(existingProduct.images.cover);
    const cover = await uploadImage(files.coverImage[0].buffer, "cover");
    images.cover = cover;
  }

  if (files?.sideImage?.[0]) {
    await deleteCloudinaryImage(existingProduct.images.side);
    const side = await uploadImage(files.sideImage[0].buffer, "side");
    images.side = side;
  }

  if (files?.backImage?.[0]) {
    await deleteCloudinaryImage(existingProduct.images.back);
    const back = await uploadImage(files.backImage[0].buffer, "back");
    images.back = back;
  }

  /* =========================
     SLUG + DUPLICATE CHECK
  ========================= */

  const slug = createSlug(data.title);

  const existing = await productRepo.findProductBySlug(slug);

  if (existing && existing._id.toString() !== id) {
    const error = new Error("Product already exists");
    error.type = "GLOBAL";
    throw error;
  }

  /* =========================
     UPDATE
  ========================= */

  const updatedProduct = await productRepo.updateProduct(id, {
    title: data.title,
    slug,
    author: data.author,
    description: data.description,
    category: data.category,
    images,
    variants: data.variants
  });

  return updatedProduct; // ✅ IMPORTANT
};



export const updateProductStatusService = async (id, isActive) => {

  const product = await productRepo.findProductById(id);

  if (!product) {
    const error = new Error("Product not found");
    error.type = "GLOBAL";
    throw error;
  }

  if (product.isActive === isActive) {

    const error = new Error(
      isActive
        ? "Product is already active"
        : "Product is already inactive"
    );

    error.type = "GLOBAL";
    throw error;

  }

  return productRepo.updateProductStatus(id, isActive);

};