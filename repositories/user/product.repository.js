import Product from "../../models/user/product.schema.js";

export const createProduct = async (data) => {

    return Product.create(data);

};

export const findProducts = async ({ skip, limit, filter, sort }) => {

    return Product.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate({
            path: "category",
            populate: { path: "offer" }
        })
        .populate("productOffer");

};


export const countProducts = async (filter) => {

    return Product.countDocuments(filter);

};


export const findProductById = async (id) => {

    return Product.findById(id)
        .populate("category")
        .populate("productOffer");

};


export const updateProductStatus = async (id, isActive) => {

    return Product.findByIdAndUpdate(
        id,
        { isActive },
        { new: true }
    );

};


export const softDeleteProduct = async (id) => {

    return Product.findByIdAndUpdate(
        id,
        { isDeleted: true },
        { new: true }
    );

};