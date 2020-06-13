const db = require("../../data/dbConfig.js");

module.exports={
    find,
    findBy,
    findById,
    add
}

function find(){
    return db("products")
        .orderBy('products.id')
} 

function findBy(filter) {
    return db("products")
       .where(filter)
       .orderBy("products.id");
  }
  
function findById(id) {
    return db("products").where({ id }).first();
}

async function add(product) {
    try {
      const [id] = await db("products").insert(product , "id");
      
      return findById(id);
    } catch (error) {
      throw error;
    }
  }