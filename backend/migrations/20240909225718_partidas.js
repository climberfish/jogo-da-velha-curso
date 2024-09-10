/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema
        .createTable('partidas', function (table) {
            table.increments('id');
            table.string('jogador_1', 255).notNullable();
            table.string('jogador_2', 255).nullable();
            table.string('vencedor', 255).nullable();
            table.string('status', 31).notNullable();
            table.string('jogador_atual', 255).nullable();
        })
        .createTable('jogadas', function (table) {
            table.increments('id');
            table.integer('partida_id').references('id').inTable('partidas').notNullable();
            table.string('valor', 1).notNullable();
            table.string('jogador', 255).notNullable();
        });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('jogadas').dropTable('partidas');
};
