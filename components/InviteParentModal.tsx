'use client';

import { useState } from 'react';
import { X, Mail, Send, Check, Copy, AlertCircle } from 'lucide-react';
import { createTeamInvite } from '@/lib/actions/invites';

interface InviteParentModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  teamName: string;
  coachId: string;
}

export default function InviteParentModal({
  isOpen,
  onClose,
  teamId,
  teamName,
  coachId,
}: InviteParentModalProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await createTeamInvite({
      email,
      teamId,
      sentBy: coachId,
    });

    if (result.success && result.invite) {
      setInviteLink(result.invite.inviteLink);
      setEmail('');
    } else {
      setError(result.error || 'Failed to create invite');
    }

    setIsLoading(false);
  };

  const handleCopyLink = async () => {
    if (inviteLink) {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setEmail('');
    setError('');
    setInviteLink('');
    setCopied(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-md w-full p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-white">
            Invite Parent/Viewer
          </h2>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Success State - Show Link */}
        {inviteLink ? (
          <div className="space-y-4">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-start gap-3">
              <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-green-300 font-semibold mb-1">Invite created!</p>
                <p className="text-green-300/80 text-sm">
                  Share this link with the parent to give them viewer access to {teamName}.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Invite Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inviteLink}
                  readOnly
                  className="flex-1 px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-3 bg-[#16a34a] hover:bg-[#22c55e] text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <p className="text-slate-400 text-xs mt-2">
                Parents will have read-only access to roster, schedule, and archives.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setInviteLink('')}
                className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Send Another
              </button>
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white rounded-lg hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Form State */
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <p className="text-slate-300 text-sm mb-4">
                Invite parents or guardians to view your team&apos;s roster, schedule, and game
                archives. They&apos;ll have read-only access.
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Parent&apos;s Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-slate-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-all"
                  placeholder="parent@example.com"
                  required
                />
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-slate-300 mb-2">
                What parents can access:
              </h3>
              <ul className="space-y-1 text-sm text-slate-400">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  Roster (names and jersey numbers only)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  Schedule (upcoming games)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  Archive (finalized game cards with print option)
                </li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white rounded-lg hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  'Creating...'
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Invite
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
