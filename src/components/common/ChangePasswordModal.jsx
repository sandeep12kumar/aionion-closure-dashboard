import { useState } from 'react';
import toast from 'react-hot-toast';
import Modal from './Modal.jsx';
import Button from './Button.jsx';
import PasswordInput from './PasswordInput.jsx';
import { KeyIcon } from './Icons.jsx';
import { api, errorMessage } from '../../api/client.js';

export default function ChangePasswordModal({ open, onClose }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => { setForm((f) => ({ ...f, [key]: e.target.value })); setError(''); };
  const close = () => { setForm({ currentPassword: '', newPassword: '', confirm: '' }); setError(''); onClose(); };

  const submit = async (e) => {
    e.preventDefault();
    if (form.newPassword.length < 8 || !/[A-Za-z]/.test(form.newPassword) || !/\d/.test(form.newPassword)) {
      setError('New password must be at least 8 characters with letters and numbers.');
      return;
    }
    if (form.newPassword !== form.confirm) {
      setError('New password and confirmation do not match.');
      return;
    }
    setSaving(true);
    try {
      await api.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      toast.success('Password changed successfully.');
      close();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={close} title="Change password" icon={<KeyIcon />} size="sm">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <PasswordInput label="Current password" value={form.currentPassword} onChange={set('currentPassword')} autoComplete="current-password" autoFocus />
        <PasswordInput label="New password" value={form.newPassword} onChange={set('newPassword')} autoComplete="new-password" />
        <PasswordInput label="Confirm new password" value={form.confirm} onChange={set('confirm')} autoComplete="new-password" />
        <p className="text-xs text-slate-500">At least 8 characters, with letters and numbers.</p>
        {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" onClick={close}>Cancel</Button>
          <Button type="submit" loading={saving}>Update password</Button>
        </div>
      </form>
    </Modal>
  );
}
