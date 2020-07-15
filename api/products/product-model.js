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
    addImage,
    findProducts
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

  function findProducts(){
    return new Promise(async (resolve, reject) => {
      const productHeader = await db("products")
      const productPromises = productHeader.map( async product =>{
        const sizes = await findSizesByProductId(product.id)
        const img_urls = await findImagesByProductId(product.id)
        return {
          product_id: product.id,
          name: product.name,
          item_type: product.item_type,
          description: product.description,
          color: product.color,
          price: product.price,
          quantity: product.quantity,
          sizes: sizes,
          img_urls: img_urls
        }
      })
      const products = await Promise.all(productPromises)
      if (products){
        resolve(products)
      } else{
        const errorObject = {message: "Could not get products"}
        reject(errorObject)
      }
    })
  }



