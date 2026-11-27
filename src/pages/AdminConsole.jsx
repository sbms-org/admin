import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  getIssues,
  getActivityLogs,
  getPlatformReports,
  getProvidersForVerification,
  getUsers,
  getWorkPostsForModeration,
  updateIssue,
  updateProviderVerification,
  updateUser,
  updateWorkPostModeration,
} from '../api/services/adminService';
import './AdminConsole.css';

const configs = {
  providers: {
    title: 'Provider verification',
    description: 'Review submitted provider profiles and credentials before they are listed.',
    load: getProvidersForVerification,
    columns: [
      ['name', 'Provider'], ['email', 'Email'], ['phone', 'Phone'],
      ['category', 'Service category'], ['status', 'Status'], ['createdAt', 'Submitted'],
    ],
    actions: [
      { label: 'Verify', status: 'VERIFIED', className: 'btn-success' },
      { label: 'Reject', status: 'REJECTED', className: 'btn-danger' },
    ],
    update: updateProviderVerification,
    body: (status) => ({ status }),
  },
  moderation: {
    title: 'Work-post moderation',
    description: 'Review work posts for quality, safety, and compliance with platform rules.',
    load: getWorkPostsForModeration,
    columns: [
      ['title', 'Work post'], ['providerName', 'Provider'], ['category', 'Category'],
      ['description', 'Description'], ['status', 'Status'], ['createdAt', 'Submitted'],
    ],
    actions: [
      { label: 'Approve', status: 'PUBLISHED', className: 'btn-success' },
      { label: 'Reject', status: 'REJECTED', className: 'btn-danger' },
    ],
    update: updateWorkPostModeration,
    body: (status) => ({ status }),
  },
  issues: {
    title: 'Issues & incidents',
    description: 'Triage reports from clients and providers, track resolution, and close incidents.',
    load: getIssues,
    columns: [
      ['title', 'Issue'], ['reporterName', 'Reported by'], ['type', 'Type'],
      ['priority', 'Priority'], ['status', 'Status'], ['createdAt', 'Reported'],
    ],
    actions: [
      { label: 'Investigate', status: 'IN_PROGRESS', className: 'btn-warning' },
      { label: 'Resolve', status: 'RESOLVED', className: 'btn-success' },
      { label: 'Dismiss', status: 'CLOSED', className: 'btn-secondary' },
    ],
    update: updateIssue,
    body: (status) => ({ status }),
  },
};

const roleOptions = ['client', 'individual_provider', 'company_staff', 'broker', 'support_agent', 'admin'];
const statusOptions = ['ACTIVE', 'PENDING', 'SUSPENDED', 'TERMINATED'];
const fieldAliases = {
  name: ['name', 'fullName', 'fullname', 'providerName', 'title'],
  email: ['email', 'emailAddress'],
  phone: ['phone', 'mobile', 'mobileNumber'],
  category: ['category', 'serviceCategory', 'service_category'],
  status: ['status', 'verificationStatus', 'moderationStatus', 'accountStatus', 'account_status'],
  createdAt: ['createdAt', 'created_at', 'submittedAt', 'requestedAt'],
  providerName: ['providerName', 'provider_name'],
  reporterName: ['reporterName', 'reportedBy', 'reporter', 'userName'],
  title: ['title', 'subject', 'caption', 'description'],
  type: ['type', 'issueType', 'incidentType'],
  priority: ['priority', 'severity'],
  description: ['description', 'details', 'content'],
};

function getRows(response) {
  const body = response?.data;
  const value = body?.data ?? body?.items ?? body?.results ?? body;
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') {
    const collection = Object.values(value).find(Array.isArray);
    if (collection) return collection;
  }
  throw new Error('The ServiceBook API returned an invalid list response.');
}

function getReportRows(response) {
  const body = response?.data;
  const value = body?.data ?? body?.items ?? body?.results ?? body;
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') return [value];
  throw new Error('The ServiceBook API returned an invalid report response.');
}

function displayValue(value) {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'object') return Array.isArray(value) ? value.join(', ') : JSON.stringify(value);
  if (typeof value === 'string' && !Number.isNaN(Date.parse(value)) && value.includes('T')) {
    return new Date(value).toLocaleString();
  }
  return String(value);
}

function rowValue(row, key) {
  const keys = fieldAliases[key] || [key];
  return displayValue(keys.map((candidate) => row[candidate]).find((value) => value !== undefined && value !== null));
}

function getId(row) {
  return row.id ?? row._id ?? row.userId ?? row.providerId ?? row.workPostId ?? row.issueId;
}

export function AdminQueue({ type }) {
  const config = configs[type];
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setRows(getRows(await config.load()));
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Unable to load records. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [config]);

  useEffect(() => { load(); }, [load]);

  const applyAction = async (row, status) => {
    const id = getId(row);
    if (id === undefined || id === null) {
      toast.error('This record is missing its identifier and cannot be updated.');
      return;
    }
    setProcessingId(id);
    try {
      await config.update(id, config.body(status));
      toast.success(`Record updated: ${status.toLowerCase()}`);
      setRows((current) => current.filter((item) => getId(item) !== id));
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || 'Update failed. Please retry.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <section className="admin-page">
      <header className="page-header">
        <div>
          <h2 className="page-header__title">{config.title}</h2>
          <p className="page-header__subtitle">{config.description}</p>
        </div>
        <button className="btn btn-secondary" onClick={load} disabled={loading}>Refresh</button>
      </header>
      {loading ? <div className="admin-state" role="status">Loading {config.title.toLowerCase()}…</div>
        : error ? <div className="admin-state admin-state--error" role="alert">
          <p>{error}</p><button className="btn btn-secondary" onClick={load}>Try again</button>
        </div>
          : rows.length === 0 ? <div className="admin-state" role="status">
            <h3>Queue is clear</h3><p>There are no records waiting for review.</p>
          </div>
            : <div className="table-wrapper admin-table-wrap">
              <table>
                <thead><tr>{config.columns.map(([, title]) => <th key={title}>{title}</th>)}<th>Actions</th></tr></thead>
                <tbody>{rows.map((row, index) => {
                  const id = getId(row) ?? index;
                  return <tr key={id}>
                    {config.columns.map(([key]) => <td key={key} className={key === 'description' ? 'admin-description' : ''}>
                      {rowValue(row, key)}
                    </td>)}
                    <td><div className="admin-actions">{config.actions.map((action) =>
                      <button key={action.status} className={`btn btn-sm ${action.className}`}
                        disabled={processingId !== null} onClick={() => applyAction(row, action.status)}>
                        {processingId === id ? 'Saving…' : action.label}
                      </button>)}</div></td>
                  </tr>;
                })}</tbody>
              </table>
            </div>}
    </section>
  );
}

export function UsersPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try { setRows(getRows(await getUsers())); }
    catch (requestError) { setError(requestError.response?.data?.message || requestError.message || 'Unable to load users. Please try again.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const saveField = async (row, key, value) => {
    const id = getId(row);
    if (id === undefined || id === null) return toast.error('User identifier is missing.');
    const payload = { [key]: value };
    setProcessingId(id);
    try {
      const response = await updateUser(id, payload);
      const updated = response.data?.data ?? { ...row, ...payload };
      setRows((current) => current.map((item) => getId(item) === id ? { ...item, ...updated, ...payload } : item));
      toast.success('User updated.');
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || 'User update failed.');
    } finally { setProcessingId(null); }
  };

  return <section className="admin-page">
    <header className="page-header"><div><h2 className="page-header__title">Users & access</h2>
      <p className="page-header__subtitle">Manage client, provider, and administrator roles and account status.</p></div>
      <button className="btn btn-secondary" onClick={load} disabled={loading}>Refresh</button></header>
    {loading ? <div className="admin-state" role="status">Loading users…</div>
      : error ? <div className="admin-state admin-state--error" role="alert"><p>{error}</p><button className="btn btn-secondary" onClick={load}>Try again</button></div>
        : rows.length === 0 ? <div className="admin-state" role="status"><h3>No users found</h3><p>Registered platform users will appear here.</p></div>
          : <div className="table-wrapper admin-table-wrap"><table>
            <thead><tr><th>User</th><th>Phone</th><th>Role</th><th>Account status</th><th>Joined</th></tr></thead>
            <tbody>{rows.map((row, index) => {
              const id = getId(row) ?? index;
              const roleKey = row.role !== undefined ? 'role' : 'userRole';
              const statusKey = row.status !== undefined ? 'status' : row.accountStatus !== undefined ? 'accountStatus' : 'account_status';
              return <tr key={id}>
                <td>{displayValue(row.fullName ?? row.fullname ?? row.name)}</td>
                <td>{displayValue(row.phone ?? row.mobile ?? row.mobileNumber)}</td>
                <td><label className="sr-only" htmlFor={`role-${id}`}>Role for {row.fullName ?? row.name ?? id}</label>
                  <select id={`role-${id}`} className="admin-select" value={row[roleKey] ?? ''} disabled={processingId === id}
                    onChange={(event) => saveField(row, 'role', event.target.value)}>
                    {[...new Set([...roleOptions, row[roleKey]].filter(Boolean))].map((role) => <option key={role} value={role}>{role}</option>)}
                  </select></td>
                <td><label className="sr-only" htmlFor={`status-${id}`}>Account status for {row.fullName ?? row.name ?? id}</label>
                  <select id={`status-${id}`} className="admin-select" value={row[statusKey] ?? ''} disabled={processingId === id}
                    onChange={(event) => saveField(row, 'status', event.target.value)}>
                    {[...new Set([...statusOptions, row[statusKey]].filter(Boolean))].map((status) => <option key={status} value={status}>{status}</option>)}
                  </select></td>
                <td>{displayValue(row.createdAt ?? row.joinedAt ?? row.created_at)}</td>
              </tr>;
            })}</tbody>
          </table></div>}
  </section>;
}

function scalarEntries(value, prefix = '') {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return prefix ? [[prefix, value]] : [];
  return Object.entries(value).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return child && typeof child === 'object' && !Array.isArray(child)
      ? scalarEntries(child, path) : [[path, child]];
  });
}

export function ReportsPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setReport(getReportRows(await getPlatformReports())); }
    catch (requestError) { setError(requestError.response?.data?.message || requestError.message || 'Unable to load platform reports.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  return <section className="admin-page">
    <header className="page-header"><div><h2 className="page-header__title">Platform reports</h2>
      <p className="page-header__subtitle">Live service activity and platform health data supplied by the API.</p></div>
      <button className="btn btn-secondary" onClick={load} disabled={loading}>Refresh</button></header>
    {loading ? <div className="admin-state" role="status">Loading reports…</div>
      : error ? <div className="admin-state admin-state--error" role="alert"><p>{error}</p><button className="btn btn-secondary" onClick={load}>Try again</button></div>
        : !report?.length ? <div className="admin-state" role="status"><h3>No report data</h3><p>The API returned no report rows for this period.</p></div>
          : <div className="admin-report-grid">{report.map((item, index) => {
            const entries = scalarEntries(item);
            return <article className="card admin-report-card" key={item.id ?? item.title ?? index}>
              <h3>{displayValue(item.title ?? item.name ?? item.reportType ?? `Report ${index + 1}`)}</h3>
              <dl>{entries.map(([key, value]) => <div key={key}><dt>{key.split('.').at(-1).replace(/([A-Z])/g, ' $1')}</dt><dd>{displayValue(value)}</dd></div>)}</dl>
            </article>;
          })}</div>}
  </section>;
}

export function ActivityLogsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try { setRows(getRows(await getActivityLogs())); }
    catch (requestError) { setError(requestError.response?.data?.message || requestError.message || 'Unable to load activity logs.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  return <section className="admin-page">
    <header className="page-header"><div><h2 className="page-header__title">Activity log</h2>
      <p className="page-header__subtitle">Sensitive account, moderation, consent, and payout actions recorded by the platform.</p></div>
      <button className="btn btn-secondary" onClick={load} disabled={loading}>Refresh</button></header>
    {loading ? <div className="admin-state" role="status">Loading activity logs…</div>
      : error ? <div className="admin-state admin-state--error" role="alert"><p>{error}</p><button className="btn btn-secondary" onClick={load}>Try again</button></div>
        : rows.length === 0 ? <div className="admin-state" role="status"><h3>No activity recorded</h3><p>Audited platform actions will appear here.</p></div>
          : <div className="table-wrapper admin-table-wrap"><table>
            <thead><tr><th>When</th><th>Actor</th><th>Action</th><th>Record</th><th>Details</th></tr></thead>
            <tbody>{rows.map((row, index) => {
              const id = getId(row) ?? index;
              return <tr key={id}>
                <td>{displayValue(row.createdAt ?? row.created_at ?? row.timestamp)}</td>
                <td>{displayValue(row.actorName ?? row.actor_name ?? row.actor?.name ?? row.userId ?? row.user_id)}</td>
                <td>{displayValue(row.action ?? row.eventType ?? row.event_type)}</td>
                <td>{displayValue(row.entityType ?? row.entity_type ?? row.resource ?? row.target)}</td>
                <td className="admin-description">{displayValue(row.details ?? row.metadata ?? row.description)}</td>
              </tr>;
            })}</tbody>
          </table></div>}
  </section>;
}

export function OverviewPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [usersRes, providersRes, postsRes, issuesRes] = await Promise.all([
        getUsers(), getProvidersForVerification(), getWorkPostsForModeration(), getIssues(),
      ]);
      setData({
        users: getRows(usersRes), providers: getRows(providersRes),
        posts: getRows(postsRes), issues: getRows(issuesRes),
      });
    } catch (requestError) { setError(requestError.response?.data?.message || requestError.message || 'Unable to load platform overview.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const stats = useMemo(() => data && [
    { label: 'Registered users', value: data.users.length, to: '/users' },
    { label: 'Verification reviews', value: data.providers.length, to: '/providers' },
    { label: 'Work posts to review', value: data.posts.length, to: '/work-posts' },
    { label: 'Open issues', value: data.issues.length, to: '/issues' },
  ], [data]);

  return <section className="admin-page">
    <header className="page-header"><div><h2 className="page-header__title">Platform overview</h2>
      <p className="page-header__subtitle">Operational snapshot of the ServiceBook marketplace and queues.</p></div>
      <button className="btn btn-secondary" onClick={load} disabled={loading}>Refresh</button></header>
    {loading ? <div className="admin-state" role="status">Loading platform overview…</div>
      : error ? <div className="admin-state admin-state--error" role="alert"><p>{error}</p><button className="btn btn-secondary" onClick={load}>Try again</button></div>
        : <><div className="overview-grid">{stats?.map((stat) => <Link className="overview-card" to={stat.to} key={stat.label}>
          <span>{stat.label}</span><strong>{stat.value}</strong><span className="overview-card__link">Open queue →</span>
        </Link>)}</div>
          {stats?.every(({ value }) => value === 0) && <div className="admin-state" role="status">
            <h3>No platform activity yet</h3><p>The API returned no user or queue records.</p>
          </div>}
        </>}
  </section>;
}
