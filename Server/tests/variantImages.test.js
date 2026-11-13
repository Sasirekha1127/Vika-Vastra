const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function setup(existing = [], conflictCheck = async () => null) {
    const saved = [];
    const transaction = async callback => callback({});
    const Product = { sequelize: { transaction }, create: async () => ({ id: 1 }), update: async () => {}, findByPk: async () => ({ id: 1, Variants: existing }), findAll: async () => [{ id: 1, Variants: existing }] };
    const ProductVariant = {
        sequelize: { transaction },
        bulkCreate: async rows => saved.push(...rows),
        findAll: async () => existing,
        findOne: conflictCheck,
        destroy: async () => {},
        update: async row => saved.push(row),
        create: async row => saved.push(row),
    };
    const module = { exports: {} };
    const source = fs.readFileSync(path.join(__dirname, '../controllers/productController.js'), 'utf8');
    vm.runInNewContext(source, {
        exports: module.exports,
        require: name => name === '../models/Product' ? Product
            : name === '../models/ProductVariant' ? ProductVariant
            : name.startsWith('../models/') ? {}
            : name === 'sequelize' ? { Op: { notIn: Symbol('notIn') } } : require(name),
    });
    const response = { statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; } };
    return { controller: module.exports, saved, response };
}

test('create assigns each uploaded image to its own variant index', async () => {
    const { controller, saved, response } = setup();
    await controller.createProduct({ body: { initialVariant: JSON.stringify({ variants: [{ attributes: { Color: 'Red' } }, { attributes: { Color: 'Blue' } }] }) }, files: [
        { fieldname: 'variantImage_1', path: 'uploads\\blue.jpg' },
        { fieldname: 'variantImage_0', path: 'uploads\\red.jpg' },
    ] }, response);
    assert.equal(response.statusCode, 201);
    assert.deepEqual(saved.map(row => row.image), ['uploads/red.jpg', 'uploads/blue.jpg']);
});

test('blank first variant SKU does not duplicate a later retained product SKU', async () => {
    const { controller, saved, response } = setup([{ id: 2 }]);
    await controller.updateProduct({ params: { id: '1' }, body: { sku: 'SAREE', initialVariant: JSON.stringify({ variants: [
        { sku: '', attributes: { Color: 'Red' } },
        { id: 2, sku: 'SAREE', attributes: { Color: 'Blue' } },
    ] }) } }, response);
    assert.equal(response.statusCode, 200);
    assert.deepEqual(saved.map(row => row.sku), [null, 'SAREE']);
});

test('recreated variant can reuse a SKU belonging to a removed variant of the same product', async () => {
    const { controller, saved, response } = setup([{ id: 7 }], async ({ where }) => {
        const excluded = Object.getOwnPropertySymbols(where.id).map(key => where.id[key])[0];
        return excluded.includes(7) ? null : { id: 7 };
    });
    await controller.updateProduct({ params: { id: '1' }, body: { initialVariant: JSON.stringify({ variants: [
        { sku: 'SAREE-RED', attributes: { Color: 'Red' } },
    ] }) } }, response);
    assert.equal(response.statusCode, 200);
    assert.equal(saved[0].sku, 'SAREE-RED');
});

test('duplicate explicitly assigned SKUs are still rejected', async () => {
    const { controller, saved, response } = setup();
    await controller.updateProduct({ params: { id: '1' }, body: { initialVariant: JSON.stringify({ variants: [
        { sku: ' SAME ', attributes: { Color: 'Red' } },
        { sku: 'same', attributes: { Color: 'Blue' } },
    ] }) } }, response);
    assert.equal(response.statusCode, 400);
    assert.equal(saved.length, 0);
});

test('a SKU belonging to another product is still rejected', async () => {
    const { controller, saved, response } = setup([], async () => ({ id: 99 }));
    await controller.updateProduct({ params: { id: '1' }, body: { initialVariant: JSON.stringify({ variants: [
        { sku: 'TAKEN', attributes: { Color: 'Red' } },
    ] }) } }, response);
    assert.equal(response.statusCode, 409);
    assert.equal(saved.length, 0);
});

test('editing preserves, replaces, and clears images independently', async () => {
    const { controller, saved, response } = setup([{ id: 1, image: 'keep.jpg' }, { id: 2, image: 'old.jpg' }, { id: 3, image: 'remove.jpg' }]);
    await controller.updateProduct({ params: { id: '1' }, body: { initialVariant: JSON.stringify({ variants: [
        { id: 1, attributes: { Color: 'Red' } },
        { id: 2, attributes: { Color: 'Blue' } },
        { id: 3, attributes: { Color: 'Green' }, image: null },
    ] }) }, files: [{ fieldname: 'variantImage_1', path: 'uploads/new.jpg' }] }, response);
    assert.equal(response.statusCode, 200);
    assert.deepEqual(saved.map(row => row.image), ['keep.jpg', 'uploads/new.jpg', null]);
});

for (const endpoint of ['createProduct', 'updateProduct', 'saveVariants']) {
    test(`${endpoint} lowercases attributes and rejects case-insensitive duplicate combinations`, async () => {
        const run = async variants => {
            const context = setup();
            const body = endpoint === 'saveVariants' ? { variants } : { initialVariant: JSON.stringify({ variants }) };
            await context.controller[endpoint]({ params: { id: '1', productId: '1' }, body }, context.response);
            return context;
        };
        const result = await run([{ attributes: { Color: ' BLUE ', Size: ' Small ' } }]);
        assert.ok(result.response.statusCode < 300);
        assert.deepEqual(JSON.parse(JSON.stringify(result.saved[0].attributes)), { color: 'blue', size: 'small' });
        const duplicate = await run([
            { attributes: { Color: ' BLUE ', Size: 'Small' } },
            { attributes: { size: 'small', color: 'blue' } },
        ]);
        assert.equal(duplicate.response.statusCode, 400);
        assert.equal(duplicate.saved.length, 0);
    });
}

for (const endpoint of ['getProductById', 'getAllProducts', 'getVariants']) {
    test(`${endpoint} returns attribute objects for serialized and native JSON`, async () => {
        const { controller, response } = setup([
            { id: 1, attributes: '{"Color":"Blue"}' },
            { id: 2, attributes: { Color: 'Red' } },
            { id: 3, attributes: null },
            { id: 4, attributes: 'invalid' },
            { id: 5, attributes: '[]' },
        ]);
        await controller[endpoint]({ params: { id: '1', productId: '1' } }, response);
        assert.equal(response.statusCode, 200);
        const body = JSON.parse(JSON.stringify(response.body));
        const variants = endpoint === 'getVariants' ? body : endpoint === 'getAllProducts' ? body[0].Variants : body.Variants;
        assert.deepEqual(variants.map(row => row.attributes), [{ Color: 'Blue' }, { Color: 'Red' }, {}, {}, {}]);
    });
}
