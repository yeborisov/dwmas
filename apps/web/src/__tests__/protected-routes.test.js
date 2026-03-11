import { jsx as _jsx } from "react/jsx-runtime";
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { useAuthStore } from '../store/auth';
describe('ProtectedRoute', () => {
    it('renders child if authenticated', () => {
        useAuthStore.setState({ user: { id: '1', username: 'dev', role: 'DEVELOPER' } });
        render(_jsx(MemoryRouter, { children: _jsx(ProtectedRoute, { children: _jsx("div", { children: "allowed" }) }) }));
        expect(screen.getByText('allowed')).toBeTruthy();
    });
});
