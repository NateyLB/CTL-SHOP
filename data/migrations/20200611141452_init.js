
exports.up = function(knex) {
    return knex.schema.createTable('item_type', item =>{
        item.increments();
        item.string('type').notNullable();
    })
    .createTable('products', product =>{
        product.increments();
        product.string('name').notNullable();
        product.integer('item_type').unsigned().references('item_type.id')
        .notNullable().onUpdate('CASCADE').onDelete('CASCADE');
        product.string('description').notNullable();
        product.decimal('price').notNullable();
        product.integer('quantity').notNullable();
    })
    .createTable('product_images', images=>{
        images.increments();
        images.integer('product_id').unsigned().references('products.id')
        .notNullable().onUpdate('CASCADE').onDelete('CASCADE');
        images.string('img_url').notNullable();
    })
    .createTable('product_sizes', productSize=>{
        productSize.increments();
        productSize.integer('product_id').unsigned().references('products.id')
        .notNullable().onUpdate('CASCADE').onDelete('CASCADE');
        productSize.string('size').notNullable()
        productSize.string('color').notNullable()
        productSize.integer('quantity').notNullable();
    })
    .createTable('admin', admin=>{
        admin.increments();
        admin.string('username').notNullable().unique();
        admin.string('password').notNullable();
    })
    .createTable('users', user =>{
        user.increments();
        user.string('email').notNullable().unique();
        user.string('password').notNullable();
        user.string('name').notNullable();
        user.string('street_address').notNullable();
        user.string('city').notNullable();
        user.integer('zipcode').notNullable();
        user.string('card_info')
    })
    .createTable('orders', order =>{
        order.increments();
        order.integer('user_id').unsigned().references('users.id')
        .onUpdate('CASCADE').onDelete('CASCADE');
        order.string('email');
        order.string('name');
        order.string('street_address');
        order.string('city');
        order.integer('zipcode');
        order.decimal('total').notNullable();
        order.timestamp('ordered_at').defaultTo(knex.fn.now());
        order.boolean('fulfilled').defaultTo(false)
    })
    .createTable('order_products', op =>{
        op.increments();
        op.integer('product_id').unsigned().references('products.id')
        .notNullable().onUpdate('CASCADE').onDelete('CASCADE')
        op.integer('order_id').unsigned().references('orders.id')
        .onUpdate('CASCADE').onDelete('CASCADE').notNullable();
    })
  
};

exports.down = function(knex) {
  return knex.schema
  .dropTableIfExists('order_products')
  .dropTableIfExists('orders')
  .dropTableIfExists('users')
  .dropTableIfExists('admin')
  .dropTableIfExists('product_sizes')
  .dropTableIfExists('product_images')
  .dropTableIfExists('products')
  .dropTableIfExists('item_type')
};
