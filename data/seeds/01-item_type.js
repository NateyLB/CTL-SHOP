
exports.seed = function(knex) {
  
      return knex('item_type').insert([
        {type: "Hat"},
        {type: "Pants"},
        {type: "Shirt"},
        {type: "Shoes"},
        {type: "Jacket"},
        {type: "Sweatshirt"},
        {type: "Bag"},
        {type: "Accessory"},
      ]);
};