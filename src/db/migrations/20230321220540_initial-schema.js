export const up = async (knex) => {
  await knex.schema.createTable("roles", (table) => {
    table.increments("id").notNullable()
    table.text("name").notNullable()
    table.json("permissions").notNullable()
  })

  await knex.schema.createTable("users", (table) => {
    table.increments("id").notNullable()
    table.text("email").notNullable().unique()
    table.text("passwordHash").notNullable()
    table.text("passwordSalt").notNullable()
    table.text("firstName").notNullable()
    table.text("lastName").notNullable()
    table.integer("roleId").references("id").inTable("roles").notNullable()
  })

  await knex.schema.createTable("pages", (table) => {
    table.increments("id").notNullable()
    table.text("title").notNullable().unique()
    table.text("content").notNullable()
    table.text("url").notNullable().unique()
    table.integer("creatorId").references("id").inTable("users").notNullable()
    table.json("modifiedBy")
    table.timestamps(true, true, true)
    table.text("status").notNullable()
  })

  await knex.schema.createTable("navigationMenus", (table) => {
    table.increments("id").notNullable()
    table.text("name").notNullable()
    table.json("pages")
  })
}

export const down = async (knex) => {
  await knex.schema.dropTable("pages")
  await knex.schema.dropTable("users")
  await knex.schema.dropTable("roles")
  await knex.schema.dropTable("navigationMenus")
}
