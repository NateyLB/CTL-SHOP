const db = require("../../data/dbConfig.js");

module.exports={
    findProduct,
    findProductBy,
    findProductById,
    addProduct,
    addSize,
    findSizesByProductId
}

function findProduct(){
    return db("products")
        .orderBy('products.id')
} 

function findProductBy(filter) {
    return db("products")
       .where(filter)
       .orderBy("products.id");
  }
  
function findProductById(id) {
    return db("products").where({ id }).first();
}

async function addProduct(product) {
    try {
      const [id] = await db("products").insert(product , "id");
      
      return findProductById(id);
    } catch (error) {
      throw error;
    }
  }

function findSizeById(id){
  return db("product_sizes").where({ id }).first();

}

function findSizesByProductId(product_id){
  return db("product_sizes").where({ product_id})
}

async function addSize(size){
  try {
    const [id] = await db("product_sizes").insert(size, "id")
    return findSizeById(id)
  } catch(error){
    throw error
  }
}