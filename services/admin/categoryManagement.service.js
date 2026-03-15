import * as categoryRepo from '../../repositories/user/category.repository.js'
import { createSlug } from "../../utils/slugify.js";

export const getCategoriesService = async (query) => {

  const page = parseInt(query.page) || 1;
  const limit = 5;

  const skip = (page - 1) * limit;

  const filter = {
    isDeleted: false
  };

  if (query.search && query.search.trim() !== "") {

    const regex = new RegExp(query.search.trim(), "i");

    filter.name = regex;

  }

  if (query.status === "active") {
    filter.isActive = true;
  }

  if (query.status === "inactive") {
    filter.isActive = false;
  }

  let sort = { createdAt: -1 };

  if (query.sort === "old") {
    sort = { createdAt: 1 };
  }

  if (query.sort === "az") {
    sort = { name: 1 };
  }

  if (query.sort === "za") {
    sort = { name: -1 };
  }

  const categories = await categoryRepo.findCategories({
    skip,
    limit,
    filter,
    sort
  });

  const totalCategories = await categoryRepo.countCategories(filter);

  const totalPages = Math.ceil(totalCategories / limit);

  return {
    categories,
    totalCategories,
    page,
    totalPages
  };

};


export const createCategoryService = async (data) => {

  const slug = createSlug(data.name);

  const existing = await categoryRepo.findCategoryBySlug(slug);

  if (existing) {
    throw new Error("Category already exists");
  }

  return categoryRepo.createCategory({
    ...data,
    slug
  });

};


export const updateCategoryService = async (id, data) => {

  const slug = createSlug(data.name);

  const existing = await categoryRepo.findCategoryBySlug(slug);

  if (existing && existing._id.toString() !== id) {
    throw new Error("Category already exists");
  }

  const category = await categoryRepo.updateCategory(id, {
    ...data,
    slug
  });

  if (!category) {
    throw new Error("Category not found");
  }

  return category;

};



export const activateCategoryService = async (id) => {

  return categoryRepo.updateCategoryStatus(id, true);

};



export const deactivateCategoryService = async (id) => {

  return categoryRepo.updateCategoryStatus(id, false);

};