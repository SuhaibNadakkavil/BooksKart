import Cart from "../../models/user/cart.schema.js";

export const addToCart = async ({
  userId,
  productId,
  variantType,
  quantity
}) => {

  const cart = await Cart.findOne({ userId });

  if (!cart) {
    await Cart.create({
      userId,
      items: [{ productId, variantType, quantity }]
    });

    return { action: "added" };
  }

  const existingItem = cart.items.find(
    item =>
      item.productId.toString() === productId.toString() &&
      item.variantType.toLowerCase() === variantType.toLowerCase()
  );

  if (existingItem) {
    existingItem.quantity += quantity;
    await cart.save();

    return { action: "updated" };
  }

  cart.items.push({ productId, variantType, quantity });
  await cart.save();

  return { action: "added" };

};


export const removeCartItem = async ({ userId, productId, variantType }) => {

  return Cart.updateOne(
    { userId },
    {
      $pull: {
        items: {
          productId,
          variantType: variantType.toLowerCase()
        }
      }
    }
  );

};


export const updateCartItemQuantity = async ({
  userId,
  productId,
  variantType,
  quantity
}) => {

  return await Cart.updateOne(
    {
      userId,
      items: {
        $elemMatch: {
          productId,
          variantType: variantType.toLowerCase()
        }
      }
    },
    {
      $set: {
        "items.$.quantity": quantity
      }
    }
  );
};


export const findCartProducts = async (userId) => {

  const pipeline = [

    { $match: { userId } },

    { $unwind: "$items" },

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

        images: {
          cover: "$product.images.cover"
        },

        variants: "$product.variants",
        variantType: "$items.variantType",
        quantity: "$items.quantity",

        isActive: "$product.isActive",
        isDeleted: "$product.isDeleted",

        productOffer: 1,

        category: {
          _id: "$category._id",
          name: "$category.name",
          slug: "$category.slug",
          offer: "$category.offer",
          isActive: "$category.isActive",
          isDeleted: "$category.isDeleted"
        }

      }
    }

  ];

  return Cart.aggregate(pipeline);

};


import mongoose from "mongoose";

export const getCartCountByUser = async (userId) => {

  const result = await Cart.aggregate([

    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId)
      }
    },

    { $unwind: "$items" },

    {
      $group: {
        _id: null,
        total: { $sum: "$items.quantity" }
      }
    }

  ]);

  return result[0]?.total || 0;

};


export const findCartByUser = async (userId) => {
  return Cart.findOne({ userId });
};