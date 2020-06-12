const db = require("../../data/dbConfig.js");

module.exports = {
  add,
  find,
  findBy,
  findById
};

function find() {
  return db("admin")
    .orderBy("admin.id");
}

function findBy(filter) {
  return db("admin")
     .where(filter)
     .orderBy("admin.id");
}

function findById(id) {
    return db("admin").where({ id }).first();
  }

async function add(admin) {
  try {
    const [id] = await db("admin").insert(admin , "id");
    
    return findById(id);
  } catch (error) {
    throw error;
  }
}



