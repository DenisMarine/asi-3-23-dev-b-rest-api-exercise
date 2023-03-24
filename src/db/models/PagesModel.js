import BaseModel from "./BaseModel.js"
import UsersModel from "./UsersModel.js"

class PagesModel extends BaseModel {
  static tableName = "pages"

  static relationMappings() {
    return {
      createdBy: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: UsersModel,
        join: {
          from: "pages.creatorId",
          to: "users.id",
        },
      },
    }
  }
}

export default PagesModel
