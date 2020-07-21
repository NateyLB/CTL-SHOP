const db = require("../../data/dbConfig.js");

module.exports = {
  findProductHeader,
  findProductHeaderBy,
  findProductHeaderById,
  addProductHeader,
  addSize,
  findSizesByProductId,
  findImageById,
  findImagesByProductId,
  deleteImageById,
  addImage,
  findProducts,
  findProductById,
  updateProductById,

}


function findSizeById(id) {
  return db("product_sizes").where({ id }).first();

}

function findSizesByProductId(product_id) {
  return db("product_sizes").where({ product_id })
}

async function addSize(size) {
  try {
    const [id] = await db("product_sizes").insert(size, "id")
    return findSizeById(id)
  } catch (error) {
    throw error
  }
}
function findImageById(id) {
  return db("product_images").where({ id }).first();

}

function findImagesByProductId(product_id) {
  return db("product_images").where({ product_id })
}

async function addImage(image) {
  try {
    const [id] = await db("product_images").insert(image, "id")
    return findImageById(id)
  } catch (error) {
    throw error
  }
}
async function deleteImageById(product_id, img_url) {
  return new Promise(async (resolve, reject) => {
    const deleted = await db("product_images").where("product_images.img_url", img_url).del()
        if (deleted > 0) {
          const images = await findImagesByProductId(product_id)
          resolve(
            images
          )
        }
        else{
          const errorObject = { message: "Could not delete that URL" }
          reject(errorObject)
        }
  })


}
function findProductHeader() {
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
    const [id] = await db("products").insert(product, "id");

    return findProductHeaderById(id);
  } catch (error) {
    throw error;
  }
}

function findProducts() {
  return new Promise(async (resolve, reject) => {
    const productHeaders = await db("products")
    const productPromises = productHeaders.map(async product => {
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
    if (products) {
      resolve(products)
    } else {
      const errorObject = { message: "Could not get products" }
      reject(errorObject)
    }
  })
}

function findProductById(id) {
  return new Promise(async (resolve, reject) => {
    const productHeader = await db("products").where("products.id", id)
    const sizes = await db("product_sizes").where("product_sizes.product_id", id)
    const img_urls = await db("product_images").where("product_images.product_id", id)
    const productPromise = {
      product_id: productHeader[0].id,
      name: productHeader[0].name,
      item_type: productHeader[0].item_type,
      description: productHeader[0].description,
      color: productHeader[0].color,
      price: productHeader[0].price,
      quantity: productHeader[0].quantity,
      sizes: sizes,
      img_urls: img_urls
    }
    const product = await Promise.resolve(productPromise)
    if (product) {
      resolve(product)
    } else {
      const errorObject = { message: "Could not get product by that ID" }
      reject(errorObject)
    }
  })
}

function updateProductById(id, product) {
  return new Promise(async (resolve, reject) => {
    await db("products").where("products.id", id).update({
      name: product.name,
      description: product.description,
      price: product.price,
      quantity: product.quantity,
    })
    product.sizes.forEach(async size => {
      await db("product_sizes").where("id", size.id).update({
        product_id: size.product_id,
        size: size.size,
        color: size.color,
        quantity: size.quantity
      })
    })
    const productRes = await findProductById(product.product_id)
    if (productRes) {
      resolve(productRes)
    } else {
      const errorObject = { message: "Could not get product by that ID" }
      reject(errorObject)
    }
  })
}





