import * as productRepo from "../../repositories/user/product.repository.js";
import * as offerRepo from "../../repositories/user/offer.repository.js";
import { createSlug } from "../../utils/slugify.js";
import cloudinary from "../../config/cloudinary.js";

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

    if (query.status === "active") {
        filter.isActive = true;
    }

    if (query.status === "inactive") {
        filter.isActive = false;
    }


    /* =========================
    SORT
    ========================= */

    let sort = { createdAt: -1 };

    if (query.sort === "old") {
        sort = { createdAt: 1 };
    }

    if (query.sort === "az") {
        sort = { title: 1 };
    }

    if (query.sort === "za") {
        sort = { title: -1 };
    }

    if (query.sort === "priceLow") {
        sort = { "variants.salePrice": 1 };
    }

    if (query.sort === "priceHigh") {
        sort = { "variants.salePrice": -1 };
    }


    /* =========================
    GET PRODUCTS
    ========================= */

    const products = await productRepo.findProducts({
        skip,
        limit,
        filter,
        sort
    });


    /* =========================
    OFFER EXPIRY CHECK
    ========================= */

    const now = new Date();

    for (const product of products) {

        if (product.productOffer && product.productOffer.expiryDate < now) {

            await offerRepo.deleteOffer(product.productOffer._id);

            product.productOffer = null;

        }

    }


    /* =========================
    PAGINATION
    ========================= */

    const totalProducts = await productRepo.countProducts(filter);

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

    const cover = await uploadImage(files.coverImage[0].buffer, "cover");
    const side = await uploadImage(files.sideImage[0].buffer, "side");
    const back = await uploadImage(files.backImage[0].buffer, "back");

    const images = {
        cover,
        side,
        back
    };

    const slug = createSlug(data.title);

    await productRepo.createProduct({
        title: data.title,
        slug,
        author: data.author,
        description: data.description,
        category: data.category,
        images,
        variants: data.variants
    });

};