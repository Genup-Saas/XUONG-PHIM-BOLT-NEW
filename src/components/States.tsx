import type { ReactNode } from 'react';

export function EmptyState({
  icon,
  title,
  message,
  action,
}: {
  icon: ReactNode;
  title: string;
  message: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <strong>{title}</strong>
      <span>{message}</span>
      {action && (
        <button className="primary-button empty-action" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="project-card skeleton-card">
      <div className="project-image skeleton-shimmer" />
      <div className="project-info">
        <div className="skeleton-line w-60" />
        <div className="skeleton-line w-40" />
      </div>
      <div className="project-meta">
        <div className="skeleton-line w-30" />
      </div>
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="empty-state error-state">
      <div className="empty-icon error-icon">!</div>
      <strong>Something went wrong</strong>
      <span>{message}</span>
      <button className="primary-button empty-action" onClick={onRetry}>
        Try again
      </button>
    </div>
  );
}
