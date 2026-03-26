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

  const pipeline = [

    /* =========================
       BASE FILTER
    ========================= */
    {
      $match: {
        isActive: true,
        isDeleted: false
      }
    },

    /* =========================
       SORT (NEW ARRIVALS)
    ========================= */
    {
      $sort: { createdAt: -1 }
    },

    {
      $limit: limit
    },

    /* =========================
       CATEGORY JOIN
    ========================= */
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "category"
      }
    },

    { $unwind: "$category" },

    {
      $match: {
        "category.isActive": true,
        "category.isDeleted": false
      }
    },

    /* =========================
       PRODUCT OFFER
    ========================= */
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

    /* =========================
       CATEGORY OFFER
    ========================= */
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

    /* =========================
       FINAL SHAPE
    ========================= */
    {
      $project: {

        title: 1,
        author: 1,
        slug: 1,

        images: {
          cover: "$images.cover"
        },

        variants: 1,

        productOffer: 1,
        category: {
          offer: "$category.offer"
        }

      }
    }

  ];

  return Product.aggregate(pipeline);

};


export const findShopProducts = async ({
  filter,
  sort,
  skip,
  limit,
  categorySlugs
}) => {

  const pipeline = [

    /* =================================
       PRODUCT BASE FILTER
    ================================= */

    {
      $match: filter
    },


    /* =================================
       CATEGORY JOIN
    ================================= */

    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "category"
      }
    },

    { $unwind: "$category" },


    /* =================================
       FILTER INACTIVE CATEGORY
    ================================= */

    {
      $match: {
        "category.isActive": true,
        "category.isDeleted": false,
        ...(categorySlugs.length && {
          "category.slug": { $in: categorySlugs }
        })
      }
    },


    /* =================================
       PRODUCT OFFER JOIN
    ================================= */

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


    /* =================================
       CATEGORY OFFER JOIN
    ================================= */

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


    /* =================================
       SORT
    ================================= */

    {
      $sort: sort
    },


    /* =================================
       PAGINATION + COUNT
    ================================= */

    {
      $facet: {

        products: [
          { $skip: skip },
          { $limit: limit },

          /* Reduce payload */

          {
              $project: {
                  title: 1,
                  slug: 1,
                  author: 1,
                  images: {
                      cover: "$images.cover"
                  },
                  variants: 1,
                  productOffer: 1,
                  category: {
                      name: "$category.name",
                      slug: "$category.slug",
                      offer: "$category.offer"
                  }
              }
          }

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



export const findProductDetailsBySlug = async (slug) => {

  const pipeline = [

    /* ==============================
       MATCH PRODUCT
    ============================== */

    {
      $match: {
        slug: slug,
        isDeleted: false
      }
    },


    /* ==============================
       CATEGORY JOIN
    ============================== */

    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "category"
      }
    },

    { $unwind: "$category" },


    /* ==============================
       FILTER BLOCKED CATEGORY
    ============================== */

    {
      $match: {
        "category.isActive": true,
        "category.isDeleted": false
      }
    },


    /* ==============================
       PRODUCT OFFER
    ============================== */

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


    /* ==============================
       CATEGORY OFFER
    ============================== */

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


    /* ==============================
       REDUCE PAYLOAD
    ============================== */

    {
      $project: {

        title: 1,
        slug: 1,
        author: 1,
        description: 1,

        isActive: 1,
        stock: 1,

        images: 1,
        variants: 1,

        productOffer: 1,

        category: {
          _id: "$category._id",
          name: "$category.name",
          slug: "$category.slug",
          offer: "$category.offer"
        }

      }
    }

  ];

  const result = await Product.aggregate(pipeline);

  return result[0] || null;

};


export const findRelatedProducts = async ({
  categoryId,
  productId,
  limit = 4
}) => {

  const pipeline = [

    /* ==============================
       BASE FILTER
    ============================== */

    {
      $match: {
        category: categoryId,
        _id: { $ne: productId },
        isActive: true,
        isDeleted: false
      }
    },


    /* ==============================
       CATEGORY JOIN
    ============================== */

    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "category"
      }
    },

    { $unwind: "$category" },


    {
      $match: {
        "category.isActive": true,
        "category.isDeleted": false
      }
    },


    /* ==============================
       PRODUCT OFFER
    ============================== */

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


    /* ==============================
       CATEGORY OFFER
    ============================== */

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


    /* ==============================
       SORT
    ============================== */

    {
      $sort: { createdAt: -1 }
    },


    /* ==============================
       LIMIT
    ============================== */

    { $limit: limit },


    /* ==============================
       REDUCE PAYLOAD
    ============================== */

    {
      $project: {

        title: 1,
        slug: 1,
        author: 1,

        images: {
          cover: "$images.cover"
        },

        variants: 1,

        productOffer: 1,

        category: {
          offer: "$category.offer"
        }

      }
    }

  ];

  return Product.aggregate(pipeline);

};