import UsersModel from "./../db/models/UsersModel.js"
import NavigationMenusModel from "./../db/models/NavigationMenusModel.js"
import validate from "./../middlewares/validate.js"
import auth from "./../middlewares/auth.js"
import {
  stringValidator,
  limitValidator,
  pageValidator,
  orderValidator,
  orderFieldValidator,
  idValidator,
  jsonValidator,
} from "../validators.js"

const ADMIN_ID = 1
const MANAGER_ID = 2

const prepareNavigationMenuRoutes = ({ app }) => {
  app.get(
    "/navs",
    validate({
      body: {
        limit: limitValidator.required(),
        page: pageValidator.required(),
        orderField: orderFieldValidator(["name"]).default("name"),
        order: orderValidator.default("desc"),
      }.orNull,
    }),

    async (req, res) => {
      const { limit, page, orderField, order } = req.locals.body

      const query = NavigationMenusModel.query().page(page, limit)

      if (orderField) {
        query.orderBy(orderField, order)
      }

      const navs = await query

      res.send({
        result: navs,
      })
    }
  )

  app.get(
    "/navs/:navId",
    validate({
      params: {
        navId: idValidator.required(),
      },
    }),
    async (req, res) => {
      const nav = await NavigationMenusModel.query().findById(req.params.navId)

      if (!nav) {
        res.status(404).send({ error: "Not found" })

        return
      }

      res.send({ result: nav })
    }
  )

  app.post(
    "/navs",
    auth,
    validate({
      body: {
        name: stringValidator.required(),
        pages: jsonValidator.required(),
      },
    }),

    async (req, res) => {
      const {
        body: { name, pages },
        session: {
          user: { id: userId },
        },
      } = req.locals

      const user = await UsersModel.query().select("roleId").findById(userId)

      if (user.roleId !== ADMIN_ID && user.roleId !== MANAGER_ID) {
        res.status(405).send({ error: "Forbidden" })

        return
      } else {
        const new_nav = await NavigationMenusModel.query()
          .insert({
            name: name,
            pages: pages,
          })
          .returning("*")

        res.send({ result: new_nav })
      }
    }
  )

  app.patch(
    "/navs/:navId",
    auth,
    validate({
      body: {
        name: stringValidator,
        pages: jsonValidator,
      },
      params: {
        navId: idValidator.required(),
      },
    }),
    async (req, res) => {
      const {
        body: { name, pages },
        session: {
          user: { id: userIdConnected },
        },
      } = req.locals

      const user = await UsersModel.query()
        .select("roleId")
        .findById(userIdConnected)

      if (user.roleId !== ADMIN_ID && user.roleId !== MANAGER_ID) {
        res.status(405).send({ error: "Forbidden" })

        return
      } else {
        const user = await NavigationMenusModel.query().findById(
          req.params.navId
        )

        if (!user) {
          res.status(404).send({ error: "not found" })

          return
        }

        const updatedNav = await NavigationMenusModel.query()
          .update({
            ...(name ? { name } : {}),
            ...(pages ? { pages } : {}),
          })
          .where({
            id: req.params.navId,
          })
          .returning("*")

        res.send({ result: updatedNav })
      }
    }
  )

  app.delete(
    "/navs/:navId",
    auth,
    validate({
      params: {
        navId: idValidator.required(),
      },
    }),

    async (req, res) => {
      const { id: userIdConnected } = req.locals.session.user

      const user = await UsersModel.query()
        .select("roleId")
        .findById(userIdConnected)

      if (user.roleId !== ADMIN_ID && user.roleId !== MANAGER_ID) {
        res.status(405).send({ error: "Forbidden" })

        return
      } else {
        const query = NavigationMenusModel.query().findById(req.params.navId)
        const navToDelete = await query

        if (!navToDelete) {
          res.status(404).send({ error: "not found" })

          return
        }

        const delete_nav = await query.delete()

        res.send({ result: delete_nav })
      }
    }
  )
}

export default prepareNavigationMenuRoutes
