/* global window, document */
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuthStore } from '../store/auth';
export function LoginPage() {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [theme, setTheme] = useState(() => (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark'));
    const setUser = useAuthStore((s) => s.setUser);
    const navigate = useNavigate();
    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'light')
            root.classList.add('theme-light');
        else
            root.classList.remove('theme-light');
    }, [theme]);
    const loginMutation = useMutation({
        mutationFn: async () => {
            const res = await api.post('/auth/login', { username, password });
            return res.data;
        },
        onSuccess: (data) => {
            setError(null);
            if (data?.data) {
                setUser({ id: data.data.id, username: data.data.username, role: data.data.role });
                navigate('/dashboard');
            }
        },
        onError: (err) => {
            const message = err?.response?.data?.message || 'Login failed. Check credentials.';
            setError(message);
        }
    });
    const handleSubmit = (event) => {
        event.preventDefault();
        setError(null);
        loginMutation.mutate();
    };
    return (_jsx("div", { className: "relative min-h-screen bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.08),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(125,211,252,0.08),transparent_22%),hsl(var(--bg-base))] px-4 py-10", children: _jsxs("div", { className: "mx-auto flex max-w-4xl flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-between", children: [_jsxs("div", { className: "space-y-4 text-center lg:text-left", children: [_jsx("span", { className: "inline-flex items-center gap-2 rounded-full bg-cyan-500/15 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-cyan-200", children: "DevOps Workflow Monitoring" }), _jsxs("div", { className: "space-y-2", children: [_jsx("h1", { className: "text-3xl font-bold tracking-tight text-[hsl(var(--text-primary))] sm:text-4xl", children: "Welcome back" }), _jsx("p", { className: "max-w-xl text-[hsl(var(--text-secondary))]", children: "Sign in with GitHub or use your organization credentials." })] }), _jsxs("div", { className: "flex flex-wrap gap-3 text-sm text-[hsl(var(--text-muted))]", children: [_jsx("span", { className: "rounded-full bg-[hsl(var(--bg))] px-3 py-1 text-[hsl(var(--text-secondary))]", children: "Role-based access" }), _jsx("span", { className: "rounded-full bg-[hsl(var(--bg))] px-3 py-1 text-[hsl(var(--text-secondary))]", children: "Analytics & reports" }), _jsx("span", { className: "rounded-full bg-[hsl(var(--bg))] px-3 py-1 text-[hsl(var(--text-secondary))]", children: "Realtime updates" })] }), _jsx("button", { type: "button", className: "btn btn-secondary mt-2 inline-flex items-center gap-2 px-4 py-2 text-xs", onClick: () => setTheme(theme === 'dark' ? 'light' : 'dark'), children: theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme' })] }), _jsx("div", { className: "w-full max-w-md", children: _jsxs("div", { className: "surface space-y-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]/90 p-6 shadow-[0_24px_64px_rgba(0,0,0,0.22)] backdrop-blur", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-[hsl(var(--text-secondary))]", children: "Use GitHub OAuth" }), _jsx("p", { className: "text-xs text-[hsl(var(--text-muted))]", children: "or local credentials for quick testing" })] }), _jsx("span", { className: "rounded-full bg-cyan-500/15 px-3 py-1 text-xs font-semibold text-cyan-200", children: "demo" })] }), _jsxs("form", { className: "space-y-4", onSubmit: handleSubmit, children: [_jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-semibold text-[hsl(var(--text-secondary))]", htmlFor: "username", children: "Username" }), _jsx("input", { id: "username", name: "username", type: "text", value: username, onChange: (e) => setUsername(e.target.value), className: "field", placeholder: "your username", autoComplete: "username" })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-semibold text-[hsl(var(--text-secondary))]", htmlFor: "password", children: "Password" }), _jsx("input", { id: "password", name: "password", type: "password", value: password, onChange: (e) => setPassword(e.target.value), className: "field", placeholder: "your password", autoComplete: "current-password" })] }), _jsx("p", { className: "text-xs text-[hsl(var(--text-muted))]", children: "Use your assigned credentials or sign in via GitHub below." }), error && _jsx("p", { className: "text-sm text-red-400", children: error }), _jsx("button", { type: "submit", className: "btn btn-primary w-full py-3 text-sm font-semibold", disabled: loginMutation.isPending, children: loginMutation.isPending ? 'Signing in…' : 'Sign in with credentials' })] }), _jsxs("div", { className: "flex items-center gap-3 text-xs uppercase tracking-wide text-[hsl(var(--text-muted))]", children: [_jsx("span", { className: "flex-1 border-t border-[hsl(var(--border))]", "aria-hidden": true }), _jsx("span", { className: "px-2", children: "or continue with" }), _jsx("span", { className: "flex-1 border-t border-[hsl(var(--border))]", "aria-hidden": true })] }), _jsxs("a", { href: `${apiUrl}/auth/github`, className: "btn btn-secondary flex w-full items-center justify-center gap-2 py-3 text-sm font-semibold", children: [_jsx("svg", { className: "h-4 w-4", viewBox: "0 0 16 16", fill: "currentColor", children: _jsx("path", { d: "M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" }) }), "Sign in with GitHub"] })] }) })] }) }));
}
