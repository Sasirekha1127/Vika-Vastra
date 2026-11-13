import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import ProductView from './Productview';
import { getProductById } from '../../api';
const mockNavigate = jest.fn();
let mockReviews = [];

jest.mock('react-router-dom', () => ({
  useParams: () => ({ id: '1' }),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ state: null }),
}));
jest.mock('../../layouts/LayoutOne', () => ({ children }) => children);
jest.mock('./ProductImageViewer', () => () => null);
jest.mock('./ShopGridStandard', () => ({ ProductCard: () => null }));
jest.mock('../../api', () => ({
  getProductById: jest.fn(),
  getImageUrl: path => `https://example.com/${path}`,
  getAllReviews: async () => ({ data: mockReviews }),
}));

let container;
let root;

beforeEach(() => {
  mockReviews = [];
  localStorage.clear();
  mockNavigate.mockClear();
  global.IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement('div');
  root = createRoot(container);
});

test('customer login enables shopping and Buy Now checks out only the selected variant', async () => {
  localStorage.setItem('customer', JSON.stringify({ id: 7 }));
  getProductById.mockResolvedValue({ data: {
    id: 1, productName: 'Saree', mrp: 500, salesPrice: 450,
    Variants: [{ id: 12, attributes: { Color: 'Blue' }, stock: 3 }],
  } });
  const addToCart = jest.fn().mockResolvedValue(false);
  const addToWishlist = jest.fn();
  const onNotLoggedIn = jest.fn();
  await act(async () => root.render(<ProductView shop={{ addToCart, addToWishlist, onNotLoggedIn, cartItems: [{ productId: 1, variantId: 99 }] }} />));
  const button = text => Array.from(container.querySelectorAll('button')).find(item => item.textContent.includes(text));
  await act(async () => container.querySelector('[title="Add to Wishlist"]').click());
  expect(addToWishlist).toHaveBeenCalled();
  await act(async () => button('Add to Cart').click());
  expect(addToCart).toHaveBeenCalledWith(expect.objectContaining({ selectedVariant: expect.objectContaining({ id: 12 }) }));
  expect(onNotLoggedIn).not.toHaveBeenCalled();
  addToCart.mockClear();
  await act(async () => button('Buy Now').click());
  expect(addToCart).not.toHaveBeenCalled();
  expect(mockNavigate).toHaveBeenCalledWith('/checkout', { state: { buyNowItem: expect.objectContaining({ productId: '1', variantId: 12, quantity: 1 }) } });
});

afterEach(() => {
  act(() => root.unmount());
  jest.restoreAllMocks();
  delete global.IS_REACT_ACT_ENVIRONMENT;
});

test('shows loading while product data is still null', async () => {
  getProductById.mockReturnValue(new Promise(() => {}));
  await act(async () => root.render(<ProductView shop={{}} />));
  expect(container.textContent).toContain('Loading product');
});

test('shows not found when the API returns no product', async () => {
  getProductById.mockResolvedValue({ data: null });
  await act(async () => root.render(<ProductView shop={{}} />));
  expect(container.textContent).toContain('Product not found.');
});

test('shows not found when loading fails', async () => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  getProductById.mockRejectedValue(new Error('Request failed'));
  await act(async () => root.render(<ProductView shop={{}} />));
  expect(container.textContent).toContain('Product not found.');
});

test('defaults to the first variant and switches linked options and images', async () => {
  getProductById.mockResolvedValue({ data: {
    id: 1, productName: 'Variant product', image: 'main.jpg', mrp: 200, salesPrice: 150,
    Variants: [
      { id: 1, attributes: { Color: 'Red', Size: 'Small', Age: '15', Metre: '1' }, image: 'red.jpg', stock: 3, salesPrice: 100 },
      { id: 2, attributes: { Color: 'Blue', Size: 'Medium', Age: '15', Metre: '1' }, image: 'blue.jpg', stock: 0, salesPrice: 120 },
      { id: 3, attributes: { Color: 'Green', Size: 'Large' }, stock: 2 },
    ],
  } });
  await act(async () => root.render(<ProductView shop={{}} />));
  const mainImage = () => container.querySelector('img[alt="Variant product"]');
  const option = text => Array.from(container.querySelectorAll('button')).find(button => button.textContent.trim() === text);
  expect(mainImage().src).toBe('https://example.com/red.jpg');
  expect(container.textContent).toContain('No reviews yet');
  expect(container.textContent).not.toContain('(4 / 5)');
  expect(option('Red').getAttribute('aria-pressed')).toBe('true');
  expect(option('Small').getAttribute('aria-pressed')).toBe('true');
  expect(option('Small').style.border).toContain('2px solid');
  await act(async () => option('Blue').click());
  expect(mainImage().src).toBe('https://example.com/blue.jpg');
  expect(option('Medium').style.background).toBe(option('Blue').style.background);
  expect(container.textContent).toContain('Out of Stock');
  await act(async () => option('Green').click());
  expect(mainImage().src).toBe('https://example.com/main.jpg');
});

test('uses the actual product review average instead of a default rating', async () => {
  mockReviews = [{ productId: 1, rating: '5' }, { productId: 1, rating: '2' }, { productId: 2, rating: 1 }];
  getProductById.mockResolvedValue({ data: { id: 1, productName: 'Reviewed saree', mrp: 500, salesPrice: 450 } });
  await act(async () => root.render(<ProductView shop={{}} />));
  expect(container.textContent).toContain('3.5 / 5');
  expect(container.textContent).toContain('2 reviews');
});

test('selects initial options for older products without variant records', async () => {
  getProductById.mockResolvedValue({ data: {
    id: 1037, productName: 'Saree', mrp: 870, salesPrice: 549,
    colors: '["RED","blue"]', sizes: ['S'], ages: [15], metres: '[1]',
    Variants: [],
  } });
  await act(async () => root.render(<ProductView shop={{}} />));
  const option = text => Array.from(container.querySelectorAll('button')).find(button => button.textContent.trim() === text);
  for (const value of ['RED', 'S', '15', '1']) {
    expect(option(value).getAttribute('aria-pressed')).toBe('true');
  }
  expect(option('blue').getAttribute('aria-pressed')).toBe('false');
  await act(async () => option('blue').click());
  expect(option('blue').getAttribute('aria-pressed')).toBe('true');
  expect(option('RED').getAttribute('aria-pressed')).toBe('false');
});

test('renders serialized variant attributes as named groups instead of numbered character rows', async () => {
  getProductById.mockResolvedValue({ data: {
    id: 1, productName: 'Saree', mrp: 500, salesPrice: 450,
    Variants: [
      { id: 1, attributes: JSON.stringify({ Color: 'Red', Size: 'Small', Age: 15, Metre: 1 }), stock: 2 },
      { id: 2, attributes: JSON.stringify({ Color: 'Blue', Size: 'Medium', Age: 15, Metre: 1 }), stock: 3 },
    ],
  } });
  await act(async () => root.render(<ProductView shop={{}} />));
  const option = text => Array.from(container.querySelectorAll('button')).find(button => button.textContent.trim() === text);
  for (const value of ['Red', 'Small', '15', '1']) expect(option(value).getAttribute('aria-pressed')).toBe('true');
  const groupLabels = Array.from(container.querySelectorAll('p')).filter(p => p.style.textTransform === 'uppercase').map(p => p.textContent);
  expect(groupLabels).toEqual(expect.arrayContaining(['Color', 'Size', 'Age', 'Metre']));
  expect(groupLabels.some(label => /^\d+$/.test(label))).toBe(false);
  await act(async () => option('Blue').click());
  expect(option('Medium').getAttribute('aria-pressed')).toBe('true');
});
