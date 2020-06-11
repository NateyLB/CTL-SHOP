
exports.up = function(knex) {
    return knex.schema.createTable('products', product =>{
        product.increments();
        product.string('name').notNullable();
        product.integer('item_type').notNullable();
        product.string('description').notNullable();
        product.string('color').notNullable();
        product.string('size').notNullable();
        product.decimal('price').notNullable();
        product.integer('quantity').notNullable();
        product.string('img_url').notNullable();
    })
    .createTable('item_type', item =>{
        item.increments();
        item.string('name').notNullable();
    })
    .createTable('admin', admin=>{
        admin.increments();
        admin.string('username').notNullable();
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
        .onUpdate('CASCADE').onDelete('CASCADE').notNullable();
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
  .dropTableIfExists('item_type')
  .dropTableIfExists('products')
};
