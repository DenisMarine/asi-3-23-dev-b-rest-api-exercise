import UsersModel from "./../db/models/UsersModel.js"
import RolesModel from "./../db/models/RolesModel.js"
import validate from "./../middlewares/validate.js"
import auth from "./../middlewares/auth.js"
import hashPassword from "./../db/hashPassword.js"
import {
  emailValidator,
  passwordValidator,
  firstNameValidator,
  lastNameValidator,
  stringValidator,
  limitValidator,
  pageValidator,
  orderValidator,
  filterValidator,
  orderFieldValidator,
  idValidator,
} from "../validators.js"

const ADMIN_ID = 1

const prepareUserRoutes = ({ app }) => {
  app.get(
    "/users",
    auth,
    validate({
      body: {
        limit: limitValidator.required(),
        page: pageValidator.required(),
        orderField: orderFieldValidator([
          "firstName",
          "lastName",
          "email",
        ]).default("fistName"),
        order: orderValidator.default("desc"),
        filterRole: filterValidator(["admin", "manager", "editor"]),
      }.orNull,
    }),

    async (req, res) => {
      const {
        body: { limit, page, orderField, order, filterRole },
        session: {
          user: { id: userId },
        },
      } = req.locals

      const userConnected = await UsersModel.query()
        .select("roleId")
        .findById(userId)

      if (userConnected.roleId !== ADMIN_ID) {
        res.status(405).send({ error: "Forbidden" })

        return
      } else {
        const query = UsersModel.query().page(page, limit)

        if (orderField) {
          query.orderBy(orderField, order)
        }

        if (filterRole) {
          const roleId = RolesModel.query()
            .select("id")
            .where("name", filterRole)

          query.where("roleId", roleId)
        }

        const users = await query

        res.send({
          result: users,
        })
      }
    }
  )

  app.get(
    "/users/:userId",
    auth,
    validate({
      params: {
        userId: idValidator.required(),
      },
    }),
    async (req, res) => {
      const { id: userIdConnected } = req.locals.session.user

      const userRoleId = await UsersModel.query()
        .select("roleId")
        .findById(userIdConnected)

      if (
        userRoleId.roleId !== ADMIN_ID ||
        userIdConnected !== parseInt(req.params.userId)
      ) {
        res.status(405).send({ error: "Forbidden" })

        return
      } else {
        const user = await UsersModel.query().findById(req.params.userId)

        if (!user) {
          res.status(404).send({ error: "Not found" })

          return
        }

        res.send({ result: user })
      }
    }
  )

  app.post(
    "/users",
    auth,
    validate({
      body: {
        email: emailValidator.required(),
        password: passwordValidator.required(),
        firstName: firstNameValidator.required(),
        lastName: lastNameValidator.required(),
        role: stringValidator.required(),
      },
    }),

    async (req, res) => {
      const {
        body: { email, password, firstName, lastName, role },
        session: {
          user: { id: userId },
        },
      } = req.locals
      const user = await UsersModel.query().select("roleId").findById(userId)

      if (user.roleId !== ADMIN_ID) {
        res.status(405).send({ error: "Forbidden" })

        return
      } else {
        const [passwordHash, passwordSalt] = await hashPassword(password)
        const new_user = await UsersModel.query()
          .insert({
            email: email,
            passwordHash: passwordHash,
            passwordSalt: passwordSalt,
            firstName: firstName,
            lastName: lastName,
            roleId: role,
          })
          .returning("*")

        res.send({ result: new_user })
      }
    }
  )

  app.patch(
    "/users/:userId",
    auth,
    validate({
      body: {
        email: emailValidator,
        firstName: firstNameValidator,
        lastName: lastNameValidator,
        password: passwordValidator,
        role: stringValidator,
      },
      params: {
        userId: idValidator.required(),
      },
    }),
    async (req, res) => {
      const {
        body: { email, firstName, lastName, password, role },
        session: {
          user: { id: userIdConnected },
        },
      } = req.locals

      const user = await UsersModel.query()
        .select("roleId")
        .findById(userIdConnected)

      if (
        user.roleId !== ADMIN_ID &&
        userIdConnected !== parseInt(req.params.userId)
      ) {
        res.status(405).send({ error: "Forbidden" })

        return
      } else {
        const user = await UsersModel.query().findById(req.params.userId)

        if (!user) {
          res.status(404).send({ error: "not found" })

          return
        }

        const updatedUser = await UsersModel.query()
          .update({
            ...(email ? { email } : {}),
            ...(firstName ? { firstName } : {}),
            ...(lastName ? { lastName } : {}),
            ...(password ? { password } : {}),
            ...(role ? { role } : {}),
          })
          .where({
            id: req.params.userId,
          })
          .returning("*")

        res.send({ result: updatedUser })
      }
    }
  )

  app.delete(
    "/users/:userId",
    auth,
    validate({
      params: {
        userId: idValidator.required(),
      },
    }),

    async (req, res) => {
      const { id: userIdConnected } = req.locals.session.user

      const user = await UsersModel.query()
        .select("roleId")
        .findById(userIdConnected)

      if (
        user.roleId !== ADMIN_ID &&
        userIdConnected !== parseInt(req.params.userId)
      ) {
        res.status(405).send({ error: "Forbidden" })

        return
      } else {
        const query = UsersModel.query().findById(req.params.userId)
        const userToDelete = await query

        if (!userToDelete) {
          res.status(404).send({ error: "not found" })

          return
        }

        const delete_user = await query.delete()

        res.send({ result: delete_user })
      }
    }
  )
}

export default prepareUserRoutes
