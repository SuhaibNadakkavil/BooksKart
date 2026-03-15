import cron from "node-cron";
import Offer from "../models/user/offer.schema.js";
import Category from "../models/user/category.schema.js";
import Product from "../models/user/product.schema.js";

export const startOfferCleanupJob = () => {

  cron.schedule("0 */4 * * *", async () => {

    try {

      console.log("Running expired offer cleanup...");

      const now = new Date();

      // find expired offers
      const expiredOffers = await Offer.find({
        expiryDate: { $lt: now }
      }).lean();

      if (!expiredOffers.length) {
        console.log("No expired offers found");
        return;
      }

      const offerIds = expiredOffers.map(o => o._id);

      // remove category offer references
      await Category.updateMany(
        { offer: { $in: offerIds } },
        { $set: { offer: null } }
      );

      // remove product offer references
      await Product.updateMany(
        { productOffer: { $in: offerIds } },
        { $set: { productOffer: null } }
      );

      // delete expired offers
      await Offer.deleteMany({
        _id: { $in: offerIds }
      });

      console.log(`Expired offers cleaned: ${offerIds.length}`);

    } catch (err) {

      console.error("Offer cleanup cron error:", err);

    }

  });

};;