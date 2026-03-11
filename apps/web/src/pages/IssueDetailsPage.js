import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { PageHeader } from '../components/ui/PageHeader';
import { SectionCard } from '../components/ui/SectionCard';
import { EmptyState } from '../components/ui/EmptyState';
export function IssueDetailsPage() {
    const { id, issueId } = useParams();
    const resolvedIssueId = id || issueId;
    const queryClient = useQueryClient();
    const [content, setContent] = useState('');
    const { data } = useQuery({
        queryKey: ['issue', resolvedIssueId],
        queryFn: async () => (await api.get(`/issues/${resolvedIssueId}`)).data,
        enabled: Boolean(resolvedIssueId)
    });
    const commentsQuery = useQuery({
        queryKey: ['comments', resolvedIssueId],
        queryFn: async () => (await api.get(`/issues/${resolvedIssueId}/comments`)).data,
        enabled: Boolean(resolvedIssueId)
    });
    const addCommentMutation = useMutation({
        mutationFn: async () => api.post(`/issues/${resolvedIssueId}/comments`, { content }),
        onSuccess: async () => {
            setContent('');
            await queryClient.invalidateQueries({ queryKey: ['comments', resolvedIssueId] });
        }
    });
    const comments = commentsQuery.data?.data ?? [];
    return (_jsxs("section", { className: "space-y-6", children: [_jsx(PageHeader, { title: data?.data?.title || 'Issue Details', description: `Status: ${data?.data?.status || 'OPEN'} • Created: ${data?.data?.createdAt ? new Date(data.data.createdAt).toLocaleString() : '-'}${data?.data?.author ? ` • Author: ${data.data.author.displayName || data.data.author.username}` : ''}` }), _jsxs(SectionCard, { title: "Discussion", description: "Collaborative comment thread for this issue", children: [!comments.length ? (_jsx(EmptyState, { title: "No comments yet", description: "Start the discussion by posting the first comment." })) : (_jsx("ul", { className: "space-y-2 text-sm", children: comments.map((comment) => (_jsxs("li", { className: "surface-muted rounded-lg p-3", children: [_jsx("p", { className: "text-sm text-[hsl(var(--text-primary))]", children: comment.content }), _jsxs("p", { className: "mt-1 text-xs text-[hsl(var(--text-muted))]", children: ["By ", comment.author?.displayName || comment.author?.username || 'Unknown', " \u2022", ' ', comment.createdAt ? new Date(comment.createdAt).toLocaleString() : '-'] })] }, comment.id))) })), _jsxs("div", { className: "mt-4 space-y-2", children: [_jsx("textarea", { className: "field min-h-24", value: content, onChange: (e) => setContent(e.target.value), placeholder: "Write a comment" }), _jsx("button", { className: "btn", onClick: () => addCommentMutation.mutate(), disabled: !content.trim(), children: "Add comment" })] })] })] }));
}
