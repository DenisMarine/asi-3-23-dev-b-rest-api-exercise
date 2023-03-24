import * as yup from "yup"

export const nameValidator = yup
  .string()
  .matches(/^[\p{L} -]+$/u, "Name is invalid")
  .label("Name")

export const firstNameValidator = nameValidator.label("First name")

export const lastNameValidator = nameValidator.label("Last name")

export const emailValidator = yup.string().email().label("E-mail")

export const idValidator = yup
  .number()
  .integer()
  .min(1)
  .label("ID")
  .typeError("Invalid ID")

export const passwordValidator = yup
  .string()
  .matches(
    /^(?=.*[^\p{L}0-9])(?=.*[0-9])(?=.*\p{Lu})(?=.*\p{Ll}).{8,}$/u,
    "Password must be at least 8 chars & contain at least one of each: lower case, upper case, digit, special char."
  )
  .label("Password")

export const stringValidator = yup.string()

export const limitValidator = yup.number().integer().min(1).max(100).default(5)

export const orderValidator = yup.string().lowercase().oneOf(["asc", "desc"])
export const orderFieldValidator = (fields) => yup.string().oneOf(fields)

export const pageValidator = yup.number().integer().min(1).default(1)

export const filterValidator = (fields) =>
  yup.string().lowercase().oneOf(fields)

export const titleValidator = yup.string().min(1).max(300)

export const contentValidator = yup.string().min(1)

export const statusValidator = yup.string().oneOf(["draft", "published"])

export const jsonValidator = yup.mixed()
