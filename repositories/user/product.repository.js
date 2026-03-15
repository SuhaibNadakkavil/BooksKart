import Product from "../../models/user/product.schema.js";

export const createProduct = async (data) => {

    return Product.create(data);

};


export const findProductById = async (id) => {

    return Product.findById(id)
        .populate("category")
        .populate("productOffer");

};


export const findProductBySlug = async (slug) => {
  return Product.findOne({ slug });
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


export const updateProduct = async (id, data) => {

  return Product.findByIdAndUpdate(
    id,
    data,
    { new: true, runValidators: true }
  );

};

export const findProductsWithCategoryFilter = async ({
    filter,
    sort,
    skip,
    limit
}) => {

    const pipeline = [

        { $match: filter },

        /* CATEGORY JOIN */

        {
            $lookup: {
                from: "categories",
                localField: "category",
                foreignField: "_id",
                as: "category"
            }
        },

        { $unwind: "$category" },

        /* FILTER CATEGORY */

        {
            $match: {
                "category.isActive": true,
                "category.isDeleted": false
            }
        },

        /* PRODUCT OFFER */

        {
            $lookup: {
                from: "offers",
                localField: "productOffer",
                foreignField: "_id",
                as: "productOffer"
            }
        },

        {
            $unwind: {
                path: "$productOffer",
                preserveNullAndEmptyArrays: true
            }
        },

        /* CATEGORY OFFER */

        {
            $lookup: {
                from: "offers",
                localField: "category.offer",
                foreignField: "_id",
                as: "category.offer"
            }
        },

        {
            $unwind: {
                path: "$category.offer",
                preserveNullAndEmptyArrays: true
            }
        },

        /* SORT */

        { $sort: sort },

        /* FACET (pagination + count) */

        {
            $facet: {

                products: [
                    { $skip: skip },
                    { $limit: limit }
                ],

                totalCount: [
                    { $count: "count" }
                ]

            }
        }

    ];

    const result = await Product.aggregate(pipeline);

    const products = result[0].products;
    const totalProducts = result[0].totalCount[0]?.count || 0;

    return { products, totalProducts };

};


export const findNewArrivalProducts = async (limit = 4) => {

  return Product.find(
    {
      isDeleted: false,
      isActive: true
    },
    {
      title: 1,
      author: 1,
      slug: 1,
      "images.cover": 1,
      "variants.regularPrice": 1,
      productOffer: 1,
      category: 1
    }
  )
    .populate({
      path: "category",
      match: {
        isActive: true,
        isDeleted: false
      },
      select: "offer"
    })
    .populate({
      path: "productOffer",
      select: "type value"
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

};