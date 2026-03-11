import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { PageHeader } from '../components/ui/PageHeader';
import { SectionCard } from '../components/ui/SectionCard';
import { EmptyState } from '../components/ui/EmptyState';

interface CommentRow {
  id: string;
  content: string;
  createdAt?: string;
  author?: {
    username?: string;
    displayName?: string;
  };
}

interface IssueRow {
  id: string;
  title: string;
  status: 'OPEN' | 'CLOSED';
  createdAt?: string;
  author?: {
    username?: string;
    displayName?: string;
  };
}

export function IssueDetailsPage() {
  const { id, issueId } = useParams();
  const resolvedIssueId = id || issueId;
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');

  const { data } = useQuery<{ data?: IssueRow }>({
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

  const comments: CommentRow[] = commentsQuery.data?.data ?? [];

  return (
    <section className="space-y-6">
      <PageHeader
        title={data?.data?.title || 'Issue Details'}
        description={`Status: ${data?.data?.status || 'OPEN'} • Created: ${data?.data?.createdAt ? new Date(data.data.createdAt).toLocaleString() : '-'}${data?.data?.author ? ` • Author: ${data.data.author.displayName || data.data.author.username}` : ''}`}
      />

      <SectionCard title="Discussion" description="Collaborative comment thread for this issue">
        {!comments.length ? (
          <EmptyState title="No comments yet" description="Start the discussion by posting the first comment." />
        ) : (
          <ul className="space-y-2 text-sm">
            {comments.map((comment) => (
              <li key={comment.id} className="surface-muted rounded-lg p-3">
                <p className="text-sm text-[hsl(var(--text-primary))]">{comment.content}</p>
                <p className="mt-1 text-xs text-[hsl(var(--text-muted))]">
                  By {comment.author?.displayName || comment.author?.username || 'Unknown'} •{' '}
                  {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : '-'}
                </p>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 space-y-2">
          <textarea
            className="field min-h-24"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a comment"
          />
          <button className="btn" onClick={() => addCommentMutation.mutate()} disabled={!content.trim()}>
            Add comment
          </button>
        </div>
      </SectionCard>
    </section>
  );
}
