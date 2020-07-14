const db = require("../../data/dbConfig.js");

module.exports={
    findProductHeader,
    findProductHeaderBy,
    findProductHeaderById,
    addProductHeader,
    addSize,
    findSizesByProductId,
    findImageById,
    findImagesByProductId,
    addImage
}


function findSizeById(id){
  return db("product_sizes").where({ id }).first();

}

function findSizesByProductId(product_id){
  return db("product_sizes").where({product_id})
}

async function addSize(size){
  try {
    const [id] = await db("product_sizes").insert(size, "id")
    return findSizeById(id)
  } catch(error){
    throw error
  }
}
function findImageById(id){
  return db("product_images").where({ id }).first();

}

function findImagesByProductId(product_id){
  return db("product_images").where({product_id})
}

async function addImage(image){
  try {
    const [id] = await db("product_images").insert(image, "id")
    return findImageById(id)
  } catch(error){
    throw error
  }
}
function findProductHeader(){
    return db("products")
        .orderBy('products.id')
} 

function findProductHeaderBy(filter) {
    return db("products")
       .where(filter)
       .orderBy("products.id");
  }
  
function findProductHeaderById(id) {
    return db("products").where({ id }).first();
}

async function addProductHeader(product) {
    try {
      const [id] = await db("products").insert(product , "id");
      
      return findProductHeaderById(id);
    } catch (error) {
      throw error;
    }
  }



