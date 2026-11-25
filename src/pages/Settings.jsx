import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getPlatformSettings, updatePlatformSettings } from '../api/services/adminService';
import './AdminConsole.css';

const humanize = (key) => key
  .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
  .replace(/[_-]/g, ' ')
  .replace(/\b\w/g, (letter) => letter.toUpperCase());

function flattenSettings(value, prefix = '') {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return prefix ? [[prefix, value]] : [];
  return Object.entries(value).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return child && typeof child === 'object' && !Array.isArray(child)
      ? flattenSettings(child, path) : [[path, child]];
  });
}

function updateAtPath(source, path, nextValue) {
  const keys = path.split('.');
  const result = { ...source };
  let cursor = result;
  let original = source;
  keys.slice(0, -1).forEach((key) => {
    cursor[key] = { ...(original?.[key] || {}) };
    cursor = cursor[key];
    original = original?.[key];
  });
  cursor[keys.at(-1)] = nextValue;
  return result;
}

const Settings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getPlatformSettings();
      const value = response.data?.data ?? response.data?.settings ?? response.data;
      if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error('The ServiceBook API returned invalid platform settings.');
      }
      setSettings(value);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Unable to load platform settings.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateValue = (path, value) => setSettings((current) => updateAtPath(current, path, value));
  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await updatePlatformSettings(settings);
      toast.success('Platform settings saved.');
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || 'Could not save settings.');
    } finally { setSaving(false); }
  };

  const fields = settings ? flattenSettings(settings) : [];
  const groups = fields.reduce((result, [path, value]) => {
    const [group, ...rest] = path.split('.');
    (result[group] ||= []).push([rest.join('.') || group, path, value]);
    return result;
  }, {});

  return <section className="admin-page">
    <header className="page-header"><div><h2 className="page-header__title">Settings & fees</h2>
      <p className="page-header__subtitle">Manage platform policies, service fees, and system-wide controls.</p></div>
      <button className="btn btn-secondary" onClick={load} disabled={loading}>Refresh</button></header>
    {loading ? <div className="admin-state" role="status">Loading platform settings…</div>
      : error ? <div className="admin-state admin-state--error" role="alert"><p>{error}</p><button className="btn btn-secondary" onClick={load}>Try again</button></div>
        : fields.length === 0 ? <div className="admin-state" role="status"><h3>No settings available</h3>
          <p>Settings will appear when the API provides the platform configuration.</p></div>
          : <form onSubmit={save} className="settings-form">
            <p className="settings-warning" role="note">Changes apply platform-wide. Confirm fee and access-policy changes before saving.</p>
            <div className="settings-grid">{Object.entries(groups).map(([group, groupFields]) =>
              <fieldset className="card settings-section" key={group}>
                <legend>{humanize(group)}</legend>
                {groupFields.map(([name, path, value]) => {
                  const fieldId = `setting-${path.replace(/[^a-z0-9]/gi, '-')}`;
                  const label = humanize(name);
                  if (typeof value === 'boolean') return <div className="settings-field settings-field--checkbox" key={path}>
                    <input id={fieldId} type="checkbox" checked={value} onChange={(event) => updateValue(path, event.target.checked)} />
                    <label htmlFor={fieldId}>{label}</label>
                  </div>;
                  return <div className="settings-field" key={path}>
                    <label htmlFor={fieldId}>{label}</label>
                    <input id={fieldId} type={typeof value === 'number' ? 'number' : 'text'}
                      step={typeof value === 'number' ? 'any' : undefined}
                      value={value ?? ''}
                      onChange={(event) => updateValue(path, typeof value === 'number' ? Number(event.target.value) : event.target.value)} />
                  </div>;
                })}
              </fieldset>)}</div>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save settings'}</button>
          </form>}
  </section>;
};

export default Settings;
