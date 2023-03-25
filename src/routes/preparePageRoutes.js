import UsersModel from "./../db/models/UsersModel.js"
import PagesModel from "./../db/models/PagesModel.js"
import validate from "./../middlewares/validate.js"
import auth from "./../middlewares/auth.js"
import {
  stringValidator,
  titleValidator,
  contentValidator,
  idValidator,
  limitValidator,
  pageValidator,
  orderFieldValidator,
  orderValidator,
  filterValidator,
  statusValidator,
} from "../validators.js"

const ADMIN_ID = 1
const MANAGER_ID = 2

const preparePageRoutes = ({ app }) => {
  app.get(
    "/pages",
    auth,
    validate({
      body: {
        limit: limitValidator.required(),
        page: pageValidator.required(),
        orderField: orderFieldValidator(["title", "url"]).default("title"),
        order: orderValidator.default("desc"),
        filterStatus: filterValidator(["draft", "published"]),
      }.orNull,
    }),

    async (req, res) => {
      const {
        body: { limit, page, orderField, order, filterStatus },
        session: {
          user: { id: userId },
        },
      } = req.locals

      if (!userId && filterStatus === "draft") {
        res.status(405).send({ error: "Forbidden" })

        return
      }

      const query = PagesModel.query().page(page, limit)

      if (orderField) {
        query.orderBy(orderField, order)
      }

      if (!userId) {
        query.where("status", "published")
      }

      if (userId && filterStatus) {
        query.where("status", filterStatus)
      }

      const pages = await query

      res.send({
        result: pages,
      })
    }
  )

  app.get(
    "/pages/:pageId",
    auth,
    validate({
      params: {
        pageId: idValidator.required(),
      },
    }),

    async (req, res) => {
      const { id: userId } = req.locals.session.user

      const pageToModify = await PagesModel.query()
        .select("status")
        .findById(req.params.pageId)

      if (!pageToModify.status) {
        res.status(404).send({ error: "Not found" })

        return
      }

      if (pageToModify.status === "draft" && !userId) {
        res.status(405).send({ error: "Forbidden" })

        return
      } else {
        const page = await PagesModel.query().findById(req.params.pageId)

        if (!page) {
          res.status(404).send({ error: "Not found" })

          return
        }

        res.send({ result: page })
      }
    }
  )

  app.post(
    "/pages",
    auth,
    validate({
      body: {
        title: titleValidator.required(),
        content: contentValidator,
        url: stringValidator.required(),
      },
    }),

    async (req, res) => {
      const {
        body: { title, content, url },
        session: {
          user: { id: userId },
        },
      } = req.locals
      const user = await UsersModel.query().select("roleId").findById(userId)

      if (user.roleId !== ADMIN_ID && user.roleId !== MANAGER_ID) {
        res.status(405).send({ error: "Forbidden" })

        return
      } else {
        const new_page = await PagesModel.query()
          .insert({
            title: title,
            content: content,
            url: url,
            creatorId: userId,
          })
          .returning("*")

        res.send({ result: new_page })
      }
    }
  )

  app.patch(
    "/pages/:pageId",
    auth,
    validate({
      body: {
        title: titleValidator,
        content: contentValidator,
        url: stringValidator,
        status: statusValidator,
      },
    }),

    async (req, res) => {
      const {
        body: { title, content, url, status },
        session: {
          user: { id: userId },
        },
      } = req.locals

      if (!userId) {
        res.status(405).send({ error: "Forbidden" })

        return
      } else {
        const page = await PagesModel.query().findById(req.params.pageId)

        if (!page) {
          res.status(404).send({ error: "not found" })

          return
        }

        let modifiedBy = null

        if (page.modifiedBy) {
          modifiedBy = {
            editors: [...page.modifiedBy, { userId: userId }],
          }
        } else {
          modifiedBy = { editors: { userId: userId } }
        }

        const updatedPage = await PagesModel.query()
          .update({
            ...(title ? { title } : {}),
            ...(content ? { content } : {}),
            ...(url ? { url } : {}),
            ...{ modifiedBy },
            ...(status ? { status } : {}),
          })
          .where({
            id: req.params.pageId,
          })
          .returning("*")

        res.send({ result: updatedPage })
      }
    }
  )

  app.delete(
    "/pages/:pageId",
    auth,
    validate({
      params: {
        pageId: idValidator.required(),
      },
    }),

    async (req, res) => {
      const { id: userId } = req.locals.session.user
      const user = await UsersModel.query().select("roleId").findById(userId)

      if (user.roleId !== ADMIN_ID && user.roleId !== MANAGER_ID) {
        res.status(405).send({ error: "Forbidden" })

        return
      } else {
        const query = PagesModel.query().findById(req.params.pageId)
        const page = await query

        if (!page) {
          res.status(404).send({ error: "not found" })

          return
        }

        const delete_page = await query.delete()

        res.send({ result: delete_page })
      }
    }
  )
}

export default preparePageRoutes
