import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { useAuthStore } from '../store/auth';

describe('ProtectedRoute', () => {
  it('renders child if authenticated', () => {
    useAuthStore.setState({ user: { id: '1', username: 'dev', role: 'DEVELOPER' } });
    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>allowed</div>
        </ProtectedRoute>
      </MemoryRouter>
    );
    expect(screen.getByText('allowed')).toBeTruthy();
  });
});
