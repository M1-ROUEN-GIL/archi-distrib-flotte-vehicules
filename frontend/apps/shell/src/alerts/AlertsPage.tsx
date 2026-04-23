import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useAuth } from '@flotte/shared-auth';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { GET_ALERTS, ACKNOWLEDGE_ALERT, RESOLVE_ALERT } from './queries';

// ── Badges ────────────────────────────────────────────────────────────────────

const SEVERITY_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  CRITICAL: { bg: '#fee2e2', color: '#b91c1c', label: 'Critique'  },
  HIGH:     { bg: '#ffedd5', color: '#c2410c', label: 'Haute'     },
  WARNING:  { bg: '#fef9c3', color: '#a16207', label: 'Avertissement' },
  INFO:     { bg: '#dbeafe', color: '#1d4ed8', label: 'Info'      },
};

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  ACTIVE:       { bg: '#fee2e2', color: '#b91c1c', label: 'Active'       },
  ACKNOWLEDGED: { bg: '#fef9c3', color: '#a16207', label: 'Acquittée'    },
  RESOLVED:     { bg: '#dcfce7', color: '#15803d', label: 'Résolue'      },
  EXPIRED:      { bg: '#f1f5f9', color: '#64748b', label: 'Expirée'      },
};

const TYPE_LABEL: Record<string, string> = {
  GEOFENCING_BREACH:    'Sortie de zone',
  SPEED_EXCEEDED:       'Excès de vitesse',
  VEHICLE_IMMOBILIZED:  'Véhicule immobilisé',
  MAINTENANCE_OVERDUE:  'Maintenance en retard',
  LICENSE_EXPIRING:     'Permis expirant',
  DELIVERY_TOUR_DELAYED:'Tournée en retard',
};

function SeverityBadge({ s }: { s: string }) {
  const st = SEVERITY_STYLE[s] ?? { bg: '#f1f5f9', color: '#64748b', label: s };
  return (
    <span style={{ backgroundColor: st.bg, color: st.color, padding: '3px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
      {st.label}
    </span>
  );
}

function StatusBadge({ s }: { s: string }) {
  const st = STATUS_STYLE[s] ?? { bg: '#f1f5f9', color: '#64748b', label: s };
  return (
    <span style={{ backgroundColor: st.bg, color: st.color, padding: '3px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
      {st.label}
    </span>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

export default function AlertsPage() {
  const { roles } = useAuth();
  const canAcknowledge = roles.some(r => ['admin', 'manager'].includes(r));
  const canResolve     = roles.some(r => ['admin', 'manager', 'technician'].includes(r));

  const [statusFilter,   setStatusFilter]   = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('');
  const [offset, setOffset] = useState(0);

  const { data, loading, error, refetch } = useQuery(GET_ALERTS, {
    variables: {
      status:   statusFilter   || null,
      severity: severityFilter || null,
      limit:    PAGE_SIZE,
      offset,
    },
    fetchPolicy: 'network-only',
  });

  const [acknowledge] = useMutation(ACKNOWLEDGE_ALERT, { onCompleted: () => refetch() });
  const [resolve]     = useMutation(RESOLVE_ALERT,     { onCompleted: () => refetch() });

  const alerts     = data?.alerts?.items     ?? [];
  const totalCount = data?.alerts?.total_count ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  const applyFilter = (status: string, severity: string) => {
    setStatusFilter(status);
    setSeverityFilter(severity);
    setOffset(0);
  };

  if (loading) return <div style={{ padding: '2rem' }}>⏳ Chargement des alertes...</div>;
  if (error)   return <div style={{ padding: '2rem', color: '#dc2626' }}>❌ Erreur GraphQL : {error.message}</div>;

  return (
    <div style={{ fontFamily: 'sans-serif' }}>

      {/* En-tête */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, color: '#0f172a' }}>
          Alertes{' '}
          <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 'normal' }}>
            ({totalCount} au total)
          </span>
        </h2>

        {/* Filtres */}
        <div style={{ display: 'flex', gap: 10 }}>
          <select
            value={statusFilter}
            onChange={e => applyFilter(e.target.value, severityFilter)}
            style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 14 }}
          >
            <option value="">Tous les statuts</option>
            <option value="ACTIVE">Active</option>
            <option value="ACKNOWLEDGED">Acquittée</option>
            <option value="RESOLVED">Résolue</option>
            <option value="EXPIRED">Expirée</option>
          </select>

          <select
            value={severityFilter}
            onChange={e => applyFilter(statusFilter, e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 14 }}
          >
            <option value="">Toutes les sévérités</option>
            <option value="CRITICAL">Critique</option>
            <option value="HIGH">Haute</option>
            <option value="WARNING">Avertissement</option>
            <option value="INFO">Info</option>
          </select>
        </div>
      </div>

      {/* Tableau */}
      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden', fontSize: 14 }}>
        <thead style={{ backgroundColor: '#f8fafc', color: '#64748b', textAlign: 'left', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <tr>
            <th style={{ padding: '10px 16px', borderBottom: '1px solid #e2e8f0' }}>Sévérité</th>
            <th style={{ padding: '10px 16px', borderBottom: '1px solid #e2e8f0' }}>Type</th>
            <th style={{ padding: '10px 16px', borderBottom: '1px solid #e2e8f0' }}>Message</th>
            <th style={{ padding: '10px 16px', borderBottom: '1px solid #e2e8f0' }}>Véhicule</th>
            <th style={{ padding: '10px 16px', borderBottom: '1px solid #e2e8f0' }}>Conducteur</th>
            <th style={{ padding: '10px 16px', borderBottom: '1px solid #e2e8f0' }}>Statut</th>
            <th style={{ padding: '10px 16px', borderBottom: '1px solid #e2e8f0' }}>Date</th>
            <th style={{ padding: '10px 16px', borderBottom: '1px solid #e2e8f0' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {alerts.length === 0 ? (
            <tr>
              <td colSpan={8} style={{ textAlign: 'center', padding: 24, color: '#94a3b8' }}>
                Aucune alerte trouvée.
              </td>
            </tr>
          ) : (
            alerts.map((a: any) => (
              <tr key={a.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '10px 16px' }}><SeverityBadge s={a.severity} /></td>
                <td style={{ padding: '10px 16px', color: '#475569' }}>{TYPE_LABEL[a.type] ?? a.type}</td>
                <td style={{ padding: '10px 16px', color: '#0f172a', maxWidth: 280 }}>{a.message}</td>
                <td style={{ padding: '10px 16px', fontFamily: 'monospace', color: '#475569', fontSize: 13 }}>
                  {a.vehicle?.plate_number ?? '—'}
                </td>
                <td style={{ padding: '10px 16px', color: '#475569', fontSize: 13 }}>
                  {a.driver ? `${a.driver.last_name} ${a.driver.first_name}` : '—'}
                </td>
                <td style={{ padding: '10px 16px' }}><StatusBadge s={a.status} /></td>
                <td style={{ padding: '10px 16px', color: '#64748b', fontSize: 13, whiteSpace: 'nowrap' }}>
                  {new Date(a.created_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                </td>
                <td style={{ padding: '10px 16px' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {canAcknowledge && a.status === 'ACTIVE' && (
                      <button
                        onClick={() => acknowledge({ variables: { id: a.id } })}
                        title="Acquitter"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ca8a04', display: 'flex', alignItems: 'center', padding: 0 }}
                      >
                        <Clock size={16} />
                      </button>
                    )}
                    {canResolve && (a.status === 'ACTIVE' || a.status === 'ACKNOWLEDGED') && (
                      <button
                        onClick={() => resolve({ variables: { id: a.id } })}
                        title="Résoudre"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#16a34a', display: 'flex', alignItems: 'center', padding: 0 }}
                      >
                        <CheckCircle size={16} />
                      </button>
                    )}
                    {a.status === 'RESOLVED' && (
                      <XCircle size={16} color="#94a3b8" />
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 16 }}>
          <button
            disabled={offset === 0}
            onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
            style={{ padding: '6px 14px', border: '1px solid #cbd5e1', borderRadius: 6, cursor: offset === 0 ? 'not-allowed' : 'pointer', backgroundColor: 'white' }}
          >
            ← Précédent
          </button>
          <span style={{ color: '#64748b', fontSize: 14 }}>Page {currentPage} / {totalPages}</span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setOffset(offset + PAGE_SIZE)}
            style={{ padding: '6px 14px', border: '1px solid #cbd5e1', borderRadius: 6, cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer', backgroundColor: 'white' }}
          >
            Suivant →
          </button>
        </div>
      )}
    </div>
  );
}
