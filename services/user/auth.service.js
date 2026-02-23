import bcrypt from 'bcrypt'
import * as userRepo from '../../repositories/user/user.repository.js'
import HTTP_STATUS from '../../utils/httpStatus.js'

//signup service

export const signupService = async ({
  name,
  email,
  phone,
  password,
  referralCode,
}) => {

  email = email.toLowerCase().trim();
  phone = phone.trim();

  const existingUser = await userRepo.findByEmail(email);
  if (existingUser) {
    const error = new Error("Email already registered");
    error.statusCode = HTTP_STATUS.BAD_REQUEST;
    error.type = "FIELD";
    error.field = "email";
    throw error;
  }

  const existingPhone = await userRepo.findByPhone(phone);
  if (existingPhone) {
    const error = new Error("Phone number already registered");
    error.statusCode = HTTP_STATUS.BAD_REQUEST;
    error.type = "FIELD";
    error.field = "phone";
    throw error;
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userRepo.createUser({
      name: name.trim(),
      email,
      phone,
      password: hashedPassword,
      referralCode: referralCode?.trim() || null,
    });

    return user;

  } catch (err) {
    const error = new Error("Something went wrong. Please try again.");
    error.statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    error.type = "GLOBAL";
    throw error;
  }
};

//login service

export const loginService = async ({email, password}) => {

    const user = await userRepo.findByEmail(email, true)
    if(!user){
        const error = new Error('Invalid email or password')
        error.statusCode = HTTP_STATUS.UNAUTHORIZED
        throw error
    }
    
    if(user.isBlocked){
        const error = new Error('Your account has been blocked')
        error.statusCode = HTTP_STATUS.FORBIDDEN
        throw error
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch){
        const error = new Error('Invalid email or password')
        error.statusCode = HTTP_STATUS.UNAUTHORIZED
        throw error
    }

    return user
}