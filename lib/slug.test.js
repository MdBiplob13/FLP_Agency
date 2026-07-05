const test = require('node:test');
const assert = require('node:assert/strict');
const { slugify } = require('./slug');

test('slugify converts titles into readable URL-safe slugs', () => {
  assert.equal(slugify('Go High Level Learning'), 'go-high-level-learning');
  assert.equal(slugify('  React & Next.js 101  '), 'react-nextjs-101');
});
