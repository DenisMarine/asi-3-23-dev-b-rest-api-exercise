import BaseModel from "./BaseModel.js"
import RolesModel from "./RolesModel.js"

class UsersModel extends BaseModel {
  static tableName = "users"

  static relationMappings() {
    return {
      createdBy: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: RolesModel,
        join: {
          from: "roles.id",
          to: "users.roleId",
        },
      },
    }
  }
}

export default UsersModel
