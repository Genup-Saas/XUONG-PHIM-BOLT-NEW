import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} title={title} maxWidth="440px">
      <div className="confirm-body">
        <div className={`confirm-icon ${destructive ? 'destructive' : ''}`}>
          <AlertTriangle size={20} />
        </div>
        <p className="confirm-message">{message}</p>
      </div>
      <div className="confirm-footer">
        <button className="ghost-button" onClick={onCancel} disabled={loading}>
          {cancelLabel}
        </button>
        <button
          className={destructive ? 'danger-button' : 'primary-button'}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? 'Working…' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
