import Category from "../../models/user/category.schema.js";

export const findCategories = async ({ skip, limit, filter, sort }) => {

  return Category.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate("offer");

};

export const countCategories = async (filter) => {

  return Category.countDocuments(filter);

};

export const createCategory = async (data) => {

  return Category.create(data);

};

export const updateCategory = async (id, data) => {

  return Category.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
  });

};

export const findCategoryById = async (id) => {

  return Category.findById(id);

};

export const findCategoryBySlug = async (slug) => {

  return Category.findOne({slug});

};

export const updateCategoryStatus = async (id, isActive) => {

  return Category.findByIdAndUpdate(
    id,
    { isActive },
    { new: true }
  );

};

export const softDeleteCategory = async (id) => {

  return Category.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );

};


export const findActiveCategories = async () => {
  return Category.find({
    isActive: true,
    isDeleted: false
  })
  .select("name slug")
  .sort({ createdAt: -1 });
};