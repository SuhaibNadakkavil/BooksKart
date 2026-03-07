import * as userRepo from "../../repositories/user/user.repository.js";

export const getUsersService = async (query) => {

  const page = parseInt(query.page) || 1;
  const limit = 5;

  const skip = (page - 1) * limit;

  const filter = {
    role: "user"
  };

  if (query.search && query.search.trim() !== "") {

    const searchRegex = new RegExp(query.search.trim(), "i");

    filter.$or = [
      { name: searchRegex },
      { email: searchRegex }
    ];

  }

  if (query.status === "active") {
    filter.isBlocked = false;
  }

  if (query.status === "blocked") {
    filter.isBlocked = true;
  }

  let sort = {
    createdAt: -1
  };

  if (query.sort === "old") {
    sort = { createdAt: 1 };
  }

  if (query.sort === "az") {
    sort = { name: 1 };
  }

  if (query.sort === "za") {
    sort = { name: -1 };
  }

  const users = await userRepo.findUsers({
    skip,
    limit,
    filter,
    sort
  });

  const totalUsers = await userRepo.countUsers(filter);

  const totalPages = Math.ceil(totalUsers / limit);

  return {
    users,
    totalUsers,
    page,
    totalPages
  };

};

export const blockUserService = async (userId) => {

  const user = await userRepo.updateUserBlockStatus(userId, true);

  if (!user) {
    const error = new Error("User not found");
    error.type = "GLOBAL";
    throw error;
  }

  return user;

};


export const unblockUserService = async (userId) => {

  const user = await userRepo.updateUserBlockStatus(userId, false);

  if (!user) {
    const error = new Error("User not found");
    error.type = "GLOBAL";
    throw error;
  }

  return user;

};