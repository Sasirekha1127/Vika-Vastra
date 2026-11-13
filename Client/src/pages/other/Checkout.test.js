import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import Checkout from './Checkout';

let mockState;
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
  useLocation: () => ({ state: mockState }),
  Link: ({ children }) => <span>{children}</span>,
}));
jest.mock('../../layouts/LayoutOne', () => ({ children }) => children);

let root;
let container;
const originalFetch = global.fetch;
beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => [] });
  window.Razorpay = jest.fn();
  localStorage.clear();
  container = document.createElement('div');
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  global.fetch = originalFetch;
  delete window.Razorpay;
  delete global.IS_REACT_ACT_ENVIRONMENT;
});

test.each([true, false])('checkout limits its order to Buy Now when enabled: %s', async direct => {
  const cartItems = [{ productId: 1, name: 'Cart product', price: 800, quantity: 1 }];
  mockState = direct ? { buyNowItem: { productId: 2, variantId: 12, name: 'Selected saree', price: 450, quantity: 2, weight: 'Color: Blue' } } : null;
  await act(async () => root.render(<Checkout shop={{ cartItems, currency: { currencyRate: 1, currencySymbol: 'Rs.' } }} />));
  const rows = container.querySelectorAll('.co-order-item');
  expect(rows).toHaveLength(1);
  expect(rows[0].textContent).toContain(direct ? 'Selected saree' : 'Cart product');
  expect(rows[0].textContent).toContain(direct ? '900.00' : '800.00');
  if (direct) expect(rows[0].textContent).toContain('Color: Blue');
  expect(cartItems).toHaveLength(1);
});
