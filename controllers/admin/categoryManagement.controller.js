import { activateCategoryService, createCategoryService, deactivateCategoryService, getCategoriesService, updateCategoryService } from '../../services/admin/categoryManagement.service.js';
import HTTP_STATUS from '../../utils/httpStatus.js'
import { createCategorySchema, updateCategorySchema } from '../../validators/admin/category.validator.js';

export const loadCategoryManagement = async (req, res, next) => {

  try {

    const success = req.session.success || null;
    const error = req.session.error || null;

    delete req.session.success;
    delete req.session.error;

    const data = await getCategoriesService(req.query);

    res.status(HTTP_STATUS.OK).render("admin/categoryManagement", {

      title: "Category Management | BooksKart",
      activePage: 'categories',

      categories: data.categories,
      totalCategories: data.totalCategories,
      page: data.page,
      totalPages: data.totalPages,

      query: req.query,

      success,
      error,

      pageScript: "/js/adminCategoryManagement.js"

    });

  } catch (err) {
    next(err);
  }

};


export const createCategory = async (req, res) => {

  try {

    const { error, value } = createCategorySchema.validate(req.body);

    if (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { name, description, status } = value;

    await createCategoryService({
      name,
      description,
      isActive: status === "on"
    });

    req.session.success = "Category added successfully";

    return res.json({
      success: true
    });

  } catch (err) {

    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: err.message
    });

  }

};



export const updateCategory = async (req, res) => {

  try {

    const { error, value } = updateCategorySchema.validate(req.body);

    if (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { id } = req.params;

    const { name, description, status } = value;

    await updateCategoryService(id, {
      name,
      description,
      isActive: status === "on"
    });

    req.session.success = "Category updated successfully";

    return res.json({
      success: true
    });

  } catch (err) {

    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: err.message
    });

  }

};



export const activateCategory = async (req, res) => {

  const { id } = req.params;

  await activateCategoryService(id);

  res.json({
    success: true,
    message: "Category activated"
  });

};



export const deactivateCategory = async (req, res) => {

  const { id } = req.params;

  await deactivateCategoryService(id);

  res.json({
    success: true,
    message: "Category deactivated"
  });

};