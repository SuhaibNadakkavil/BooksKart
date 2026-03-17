import Wishlist from "../../models/user/wishlist.schema.js";

export const findWishlistByUserId = async (userId) => {

  return Wishlist.findOne({ userId });

};

export const addToWishlist = async ({ userId, productId, variantType }) => {

  return Wishlist.findOneAndUpdate(
    { userId },
    {
      $addToSet: {
        items: {
          productId,
          variantType
        }
      }
    },
    {
      new: true,
      upsert: true
    }
  );

};


export const removeFromWishlist = async ({ userId, productId, variantType }) => {

  return Wishlist.findOneAndUpdate(
    { userId },
    {
      $pull: {
        items: {
          productId,
          variantType
        }
      }
    },
    { new: true }
  );

};


export const checkWishlistItem = async ({ userId, productId, variantType }) => {

  return Wishlist.findOne({
    userId,
    items: {
      $elemMatch: {
        productId,
        variantType
      }
    }
  });

};


export const findWishlistProducts = async (userId) => {

  const pipeline = [

    {
      $match: { userId }
    },

    {
      $unwind: "$items"
    },

    {
      $lookup: {
        from: "products",
        localField: "items.productId",
        foreignField: "_id",
        as: "product"
      }
    },

    { $unwind: "$product" },

    {
      $lookup: {
        from: "categories",
        localField: "product.category",
        foreignField: "_id",
        as: "category"
      }
    },

    { $unwind: "$category" },

    {
      $lookup: {
        from: "offers",
        localField: "product.productOffer",
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

    {
      $project: {
        productId: "$product._id",
        title: "$product.title",
        author: "$product.author",
        slug: "$product.slug",
        images: "$product.images.cover",
        variants: "$product.variants",
        variantType: "$items.variantType",
        isActive: "$product.isActive",
        isDeleted: "$product.isDeleted",
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

  return Wishlist.aggregate(pipeline);

};