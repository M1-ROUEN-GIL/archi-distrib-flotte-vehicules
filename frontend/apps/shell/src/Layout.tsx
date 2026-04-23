import { Outlet, Link, NavLink } from 'react-router-dom';
import { useAuth } from '@flotte/shared-auth';

import { Truck, Users, Wrench, LayoutDashboard, MapPin, LogOut, Bell } from 'lucide-react';
import monLogo from './assets/logo.png';

export const Layout = () => {
    const { username, roles, logout } = useAuth();
    const can = (...allowed: string[]) => roles.some(r => allowed.includes(r));

    const getInitials = (name?: string) => name ? name.substring(0, 2).toUpperCase() : '??';

    return (
        <div className="app-shell" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8fafc' }}>

            {/* EN-TÊTE FIXE */}
            <header style={{ backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 50 }}>

                {/* Ligne Supérieure : Logo + Profil */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px' }}>

                    {/* Logo & Titre */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <img
                            src={monLogo}
                            alt="Logo"
                            style={{
                                height: '40px',
                                width: 'auto',
                                objectFit: 'contain',
                                transform: 'scale(5)',
                                transformOrigin: 'left',
                                flexShrink: 0,
                            }}
                        />
                        <Link to="/" style={{ marginLeft: '220px', textDecoration: 'none' }}>
                            <p style={{ fontSize: '12px', color: '#64748b', margin: 0, marginTop: '30px' }}>Gérer mon parc automobile</p>
                        </Link>
                    </div>

                    {/* Profil Utilisateur */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>{username || 'Utilisateur'}</div>
                            <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'capitalize' }}>{roles?.[0] || 'Employé'}</div>
                        </div>

                        <div style={{
                            width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#3b82f6',
                            color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center',
                            fontWeight: '600', letterSpacing: '1px',
                        }}>
                            {getInitials(username)}
                        </div>

                        <button
                            onClick={logout}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px',
                                borderRadius: '8px', border: '1px solid #fee2e2', backgroundColor: '#fff',
                                color: '#dc2626', cursor: 'pointer', fontSize: '14px', fontWeight: '500',
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                        >
                            <LogOut size={16} /> Quitter
                        </button>
                    </div>
                </div>

                {/* Ligne Inférieure : Navigation */}
                <nav className="topnav__tabs" aria-label="Navigation principale" style={{ padding: '0 32px', display: 'flex', gap: '20px' }}>
                    <NavLink to="/" end className={({ isActive }) => `topnav__tab ${isActive ? 'is-active' : ''}`}>
                        <LayoutDashboard size={16} /> Tableau de bord
                    </NavLink>
                    {can('admin', 'technician') && (
                        <NavLink to="/vehicles" className={({ isActive }) => `topnav__tab ${isActive ? 'is-active' : ''}`}>
                            <Truck size={16} /> Véhicules
                        </NavLink>
                    )}
                    {can('admin', 'manager') && (
                        <NavLink to="/drivers" className={({ isActive }) => `topnav__tab ${isActive ? 'is-active' : ''}`}>
                            <Users size={16} /> Conducteurs
                        </NavLink>
                    )}
                    {can('admin', 'technician') && (
                        <NavLink to="/maintenance" className={({ isActive }) => `topnav__tab ${isActive ? 'is-active' : ''}`}>
                            <Wrench size={16} /> Maintenance
                        </NavLink>
                    )}
                    {can('admin', 'manager') && (
                        <NavLink to="/location" className={({ isActive }) => `topnav__tab ${isActive ? 'is-active' : ''}`}>
                            <MapPin size={16} /> Temps réel
                        </NavLink>
                    )}
                    <NavLink to="/alerts" className={({ isActive }) => `topnav__tab ${isActive ? 'is-active' : ''}`}>
                        <Bell size={16} /> Alertes
                    </NavLink>
                </nav>
            </header>

            <main className="app-shell__content" style={{ flex: 1, padding: '32px', boxSizing: 'border-box' }}>
                <Outlet />
            </main>

        </div>
    );
};
