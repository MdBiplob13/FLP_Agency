'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiImage,
  FiLock,
  FiLoader,
  FiSave,
  FiEdit2,
  FiX,
  FiShield,
  FiEye,
  FiEyeOff,
  FiLinkedin,
  FiFacebook,
  FiInstagram,
} from 'react-icons/fi';
import { authHeaders } from '@/lib/clientAuth';

const FALLBACK_AVATAR =
  'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';

const inputClass =
  'w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60';

const EMPTY_PROFILE = {
  name: '',
  email: '',
  phone: '',
  address: '',
  photo: '',
  socialLinks: { facebook: '', instagram: '', linkedin: '' },
};

const EMPTY_PASSWORD = { currentPassword: '', newPassword: '', confirmPassword: '' };

/* ------------------------------------------------------------------ */
/*  Field wrapper                                                     */
/* ------------------------------------------------------------------ */

function Field({ label, icon: Icon, children, hint }) {
  return (
    <label className="block">
      <span className="flex items-center gap-2 text-sm font-medium text-slate-300">
        {Icon ? <Icon className="h-4 w-4 text-blue-300" /> : null}
        {label}
      </span>
      <div className="mt-2">{children}</div>
      {hint ? <span className="mt-1.5 block text-xs text-slate-500">{hint}</span> : null}
    </label>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function AdminProfilePage() {
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [meta, setMeta] = useState({ role: '', createdAt: null });
  const [loading, setLoading] = useState(true);

  const [savingProfile, setSavingProfile] = useState(false);
  const [editing, setEditing] = useState(false);
  const [original, setOriginal] = useState(EMPTY_PROFILE);

  const [pwd, setPwd] = useState(EMPTY_PASSWORD);
  const [savingPwd, setSavingPwd] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  /* ---- Load the current admin's profile ---- */
  async function loadProfile() {
    setLoading(true);
    try {
      const res = await fetch('/api/users/me', { headers: authHeaders() });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        const u = data.user;
        const next = {
          name: u.name || '',
          email: u.email || '',
          phone: u.phone || '',
          address: u.address && u.address !== 'No address provided' ? u.address : '',
          photo: u.photo || '',
          socialLinks: {
            facebook: u.socialLinks?.facebook || '',
            instagram: u.socialLinks?.instagram || '',
            linkedin: u.socialLinks?.linkedin || '',
          },
        };
        setProfile(next);
        setOriginal(next);
        setMeta({ role: u.role || '', createdAt: u.createdAt || null });
      } else {
        toast.error(data.message || 'Failed to load your profile.');
      }
    } catch {
      toast.error('Network error while loading your profile.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  /* ---- Field handlers ---- */
  function handleProfileField(e) {
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, [name]: value }));
  }

  function handleSocialField(e) {
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, socialLinks: { ...p.socialLinks, [name]: value } }));
  }

  function handlePwdField(e) {
    const { name, value } = e.target;
    setPwd((p) => ({ ...p, [name]: value }));
  }

  // Discard in-progress edits and leave edit mode.
  function handleCancelEdit() {
    setProfile(original);
    setEditing(false);
  }

  /* ---- Save profile (email is intentionally not sent — it can't be changed) ---- */
  async function handleProfileSave(e) {
    e.preventDefault();
    if (!profile.name.trim()) {
      toast.error('Name is required.');
      return;
    }

    setSavingProfile(true);
    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          name: profile.name.trim(),
          phone: profile.phone.trim(),
          address: profile.address.trim() || 'No address provided',
          photo: profile.photo.trim(),
          socialLinks: profile.socialLinks,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || 'Failed to update profile.');
        return;
      }
      toast.success('Profile updated.');
      setEditing(false);
      loadProfile();
    } catch {
      toast.error('Network error while saving.');
    } finally {
      setSavingProfile(false);
    }
  }

  /* ---- Change password ---- */
  async function handlePasswordSave(e) {
    e.preventDefault();
    if (!pwd.currentPassword || !pwd.newPassword) {
      toast.error('Please fill in all password fields.');
      return;
    }
    if (pwd.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters.');
      return;
    }
    if (pwd.newPassword !== pwd.confirmPassword) {
      toast.error('New password and confirmation do not match.');
      return;
    }

    setSavingPwd(true);
    try {
      const res = await fetch('/api/users/me/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          currentPassword: pwd.currentPassword,
          newPassword: pwd.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || 'Failed to update password.');
        return;
      }
      toast.success('Password updated.');
      setPwd(EMPTY_PASSWORD);
    } catch {
      toast.error('Network error while updating password.');
    } finally {
      setSavingPwd(false);
    }
  }

  const memberSince = meta.createdAt
    ? new Date(meta.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })
    : '—';

  return (
    <div>
      {/* ---- Header ---- */}
      <div>
        <p className="text-sm uppercase tracking-[0.35em] text-blue-300">Account</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">My profile</h1>
        <p className="mt-2 text-slate-400">Update your personal details and change your password.</p>
      </div>

      {loading ? (
        <div className="mt-10 space-y-6">
          <div className="h-40 animate-pulse rounded-3xl border border-white/10 bg-slate-950/60" />
          <div className="h-72 animate-pulse rounded-3xl border border-white/10 bg-slate-950/60" />
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          {/* ===== Identity card ===== */}
          <aside className="lg:sticky lg:top-8 lg:h-fit">
            <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-6 text-center">
              <div className="relative mx-auto h-28 w-28">
                <img
                  src={profile.photo || FALLBACK_AVATAR}
                  alt={profile.name || 'Avatar'}
                  className="h-28 w-28 rounded-full object-cover ring-4 ring-blue-500/20"
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_AVATAR;
                  }}
                />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-white">{profile.name || 'Admin'}</h2>
              <p className="mt-1 truncate text-sm text-slate-400">{profile.email}</p>
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold capitalize text-blue-200 ring-1 ring-blue-500/20">
                <FiShield className="h-3 w-3" /> {meta.role || 'admin'}
              </span>
              <div className="mt-5 border-t border-white/5 pt-4 text-xs text-slate-500">
                Member since {memberSince}
              </div>
            </div>
          </aside>

          {/* ===== Forms ===== */}
          <div className="space-y-6">
            {/* Profile details */}
            <form onSubmit={handleProfileSave} className="rounded-3xl border border-white/10 bg-slate-950/60 p-6 sm:p-8">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-300 ring-1 ring-white/10">
                    <FiUser className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Profile details</h3>
                    <p className="text-sm text-slate-400">Your personal information.</p>
                  </div>
                </div>
                {!editing && (
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="inline-flex flex-none items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:border-blue-500/40 hover:text-white"
                  >
                    <FiEdit2 className="h-4 w-4" /> Edit
                  </button>
                )}
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <Field label="Full name" icon={FiUser}>
                  <input name="name" value={profile.name} onChange={handleProfileField} disabled={!editing} className={inputClass} placeholder="Your name" />
                </Field>
                <Field label="Email" icon={FiMail} hint="Email can’t be changed.">
                  <input name="email" type="email" value={profile.email} disabled readOnly className={inputClass} placeholder="you@email.com" />
                </Field>
                <Field label="Phone" icon={FiPhone}>
                  <input name="phone" value={profile.phone} onChange={handleProfileField} disabled={!editing} className={inputClass} placeholder="+8801…" />
                </Field>
                <Field label="Address" icon={FiMapPin}>
                  <input name="address" value={profile.address} onChange={handleProfileField} disabled={!editing} className={inputClass} placeholder="City, Country" />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Photo URL" icon={FiImage} hint="Paste a link to your avatar image.">
                    <input name="photo" value={profile.photo} onChange={handleProfileField} disabled={!editing} className={inputClass} placeholder="https://… or /image1.jpg" />
                  </Field>
                </div>
              </div>

              {/* Social links */}
              <div className="mt-6">
                <p className="text-sm font-medium text-slate-300">Social links <span className="text-slate-500">(optional)</span></p>
                <div className="mt-3 grid gap-5 sm:grid-cols-3">
                  <Field label="LinkedIn" icon={FiLinkedin}>
                    <input name="linkedin" value={profile.socialLinks.linkedin} onChange={handleSocialField} disabled={!editing} className={inputClass} placeholder="https://linkedin.com/in/…" />
                  </Field>
                  <Field label="Facebook" icon={FiFacebook}>
                    <input name="facebook" value={profile.socialLinks.facebook} onChange={handleSocialField} disabled={!editing} className={inputClass} placeholder="https://facebook.com/…" />
                  </Field>
                  <Field label="Instagram" icon={FiInstagram}>
                    <input name="instagram" value={profile.socialLinks.instagram} onChange={handleSocialField} disabled={!editing} className={inputClass} placeholder="https://instagram.com/…" />
                  </Field>
                </div>
              </div>

              {editing && (
                <div className="mt-7 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={savingProfile}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition-colors hover:text-white disabled:opacity-60"
                  >
                    <FiX className="h-4 w-4" /> Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:brightness-110 disabled:opacity-60"
                  >
                    {savingProfile ? <FiLoader className="h-4 w-4 animate-spin" /> : <FiSave className="h-4 w-4" />}
                    Save changes
                  </button>
                </div>
              )}
            </form>

            {/* Password */}
            <form onSubmit={handlePasswordSave} className="rounded-3xl border border-white/10 bg-slate-950/60 p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-300 ring-1 ring-white/10">
                  <FiLock className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-white">Change password</h3>
                  <p className="text-sm text-slate-400">Use at least 8 characters.</p>
                </div>
              </div>

              <div className="mt-6 grid gap-5">
                <Field label="Current password" icon={FiLock}>
                  <input
                    name="currentPassword"
                    type={showPwd ? 'text' : 'password'}
                    value={pwd.currentPassword}
                    onChange={handlePwdField}
                    autoComplete="current-password"
                    className={inputClass}
                    placeholder="••••••••"
                  />
                </Field>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="New password" icon={FiLock}>
                    <input
                      name="newPassword"
                      type={showPwd ? 'text' : 'password'}
                      value={pwd.newPassword}
                      onChange={handlePwdField}
                      autoComplete="new-password"
                      className={inputClass}
                      placeholder="At least 8 characters"
                    />
                  </Field>
                  <Field label="Confirm new password" icon={FiLock}>
                    <input
                      name="confirmPassword"
                      type={showPwd ? 'text' : 'password'}
                      value={pwd.confirmPassword}
                      onChange={handlePwdField}
                      autoComplete="new-password"
                      className={inputClass}
                      placeholder="Repeat new password"
                    />
                  </Field>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="inline-flex w-fit items-center gap-2 text-xs font-medium text-slate-400 transition-colors hover:text-blue-200"
                >
                  {showPwd ? <FiEyeOff className="h-3.5 w-3.5" /> : <FiEye className="h-3.5 w-3.5" />}
                  {showPwd ? 'Hide passwords' : 'Show passwords'}
                </button>
              </div>

              <div className="mt-7 flex justify-end">
                <button
                  type="submit"
                  disabled={savingPwd}
                  className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-purple-600 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-600/25 transition hover:brightness-110 disabled:opacity-60"
                >
                  {savingPwd ? <FiLoader className="h-4 w-4 animate-spin" /> : <FiLock className="h-4 w-4" />}
                  Update password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
