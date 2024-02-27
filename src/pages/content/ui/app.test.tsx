import { describe, expect, test } from 'vitest';
import { render } from '@testing-library/react';
import App from '@pages/content/ui/app';

describe('appTest', () => {
  test('render text', () => {
    // when
    const { getByTestId } = render(<App />);

    // then
    const testDiv = getByTestId('test-div');
    expect(testDiv.textContent).toBe('');
  });
});
