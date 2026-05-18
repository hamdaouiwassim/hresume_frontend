import { useState, useEffect, useContext, useMemo } from 'react';
import AdminLayout from '../../Layouts/AdminLayout';
import {
    Users,
    Layout,
    FileText,
    Activity,
    Loader2,
    TrendingUp,
    Shield,
    ScrollText,
    Mail,
    ArrowUpRight,
    RefreshCw,
    Sparkles,
    UserPlus,
    Clock,
    BarChart3,
    PenLine,
    Type,
    MessageSquare,
    ChevronRight,
} from 'lucide-react';
import { getDashboardStats } from '../../services/adminService';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { AuthContext } from '../../context/AuthContext';

function StatCard({
    label,
    value,
    href,
    linkLabel = 'View details',
    icon: Icon,
    gradient,
    iconBg,
    iconColor,
    subtext,
    delay = 0,
}) {
    const content = (
        <article
            className={`group relative overflow-hidden rounded-2xl border border-white/60 bg-white p-5 shadow-sm ring-1 ring-gray-100/80 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:ring-purple-100 ${href ? 'cursor-pointer' : ''}`}
            style={{ animationDelay: `${delay}ms` }}
        >
            <div
                className={`pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full opacity-40 blur-2xl transition-opacity group-hover:opacity-60 ${gradient}`}
                aria-hidden
            />
            <div className="relative flex items-start justify-between gap-3">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-sm ${iconBg}`}>
                    <Icon className={`h-6 w-6 ${iconColor}`} strokeWidth={2} />
                </div>
                <span className="text-right text-xs font-semibold uppercase tracking-wide text-gray-400">
                    {label}
                </span>
            </div>
            <p className="relative mt-4 text-3xl font-bold tracking-tight text-gray-900 tabular-nums">
                {value ?? 0}
            </p>
            {subtext && <p className="relative mt-1 text-sm text-gray-500">{subtext}</p>}
            {href && (
                <span className="relative mt-4 inline-flex items-center gap-1 text-sm font-semibold text-purple-600 transition-colors group-hover:text-purple-700">
                    {linkLabel}
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
            )}
        </article>
    );

    if (href) {
        return <Link to={href}>{content}</Link>;
    }
    return content;
}

function ActivityMeter({ label, value, max, accentClass }) {
    const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 text-sm">
                <span className="font-medium text-gray-600">{label}</span>
                <span className="font-bold tabular-nums text-gray-900">{value}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                    className={`h-full rounded-full transition-all duration-700 ${accentClass}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}

function QuickActionCard({ to, icon: Icon, title, description, variant = 'default' }) {
    const variants = {
        primary:
            'border-purple-200/80 bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-md shadow-purple-200/50 hover:shadow-lg hover:shadow-purple-300/40',
        default:
            'border-gray-100 bg-white text-gray-900 hover:border-purple-100 hover:bg-purple-50/50',
        soft: 'border-indigo-100 bg-indigo-50/80 text-indigo-950 hover:bg-indigo-100',
    };

    return (
        <Link
            to={to}
            className={`group flex items-start gap-4 rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5 ${variants[variant]}`}
        >
            <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                    variant === 'primary' ? 'bg-white/20' : 'bg-purple-100 text-purple-700'
                }`}
            >
                <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
                <p className={`font-semibold ${variant === 'primary' ? 'text-white' : 'text-gray-900'}`}>{title}</p>
                <p className={`mt-0.5 text-xs leading-relaxed ${variant === 'primary' ? 'text-white/85' : 'text-gray-500'}`}>
                    {description}
                </p>
            </div>
            <ChevronRight
                className={`mt-1 h-5 w-5 shrink-0 opacity-50 transition-transform group-hover:translate-x-0.5 ${
                    variant === 'primary' ? 'text-white' : 'text-gray-400'
                }`}
            />
        </Link>
    );
}

function RecentSection({ title, icon: Icon, iconClass, viewAllHref, viewAllClass, children, emptyMessage }) {
    const hasItems = children && (Array.isArray(children) ? children.length > 0 : true);

    return (
        <section className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm ring-1 ring-gray-100/80">
            <header className="flex items-center justify-between gap-3 border-b border-gray-100 bg-gradient-to-r from-gray-50/80 to-white px-5 py-4">
                <div className="flex items-center gap-2.5">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconClass}`}>
                        <Icon className="h-4 w-4" />
                    </div>
                    <h2 className="text-base font-bold text-gray-900">{title}</h2>
                </div>
                {viewAllHref && (
                    <Link to={viewAllHref} className={`text-xs font-semibold hover:underline ${viewAllClass}`}>
                        View all
                    </Link>
                )}
            </header>
            <div className="flex-1 p-4">
                {hasItems ? (
                    <ul className="space-y-2">{children}</ul>
                ) : (
                    <p className="py-8 text-center text-sm text-gray-400">{emptyMessage}</p>
                )}
            </div>
        </section>
    );
}

function RecentUserRow({ user, formatDate }) {
    return (
        <li>
            <Link
                to={`/admin/users`}
                className="flex items-center gap-3 rounded-xl border border-transparent p-3 transition-colors hover:border-purple-100 hover:bg-purple-50/40"
            >
                <img
                    src={user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                    alt=""
                    className="h-10 w-10 rounded-full border-2 border-white shadow ring-1 ring-purple-100"
                />
                <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-gray-900">{user.name}</p>
                    <p className="truncate text-xs text-gray-500">{user.email}</p>
                </div>
                <time className="shrink-0 text-xs font-medium text-gray-400">{formatDate(user.created_at)}</time>
            </Link>
        </li>
    );
}

export default function AdminDashboard() {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchStats = async (silent = false) => {
        try {
            if (!silent) setIsLoading(true);
            else setIsRefreshing(true);
            const response = await getDashboardStats();
            if (response.data.status) {
                setStats(response.data.data);
            } else {
                toast.error('Failed to load dashboard stats');
            }
        } catch {
            toast.error('Failed to load dashboard stats');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch {
            return 'N/A';
        }
    };

    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    }, []);

    const activityMax = useMemo(() => {
        const u = stats?.total_users || 1;
        return Math.max(u, stats?.active_users_7d || 0, stats?.active_users_24h || 0, 1);
    }, [stats]);

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-gray-100 bg-white/80 p-12 shadow-sm">
                    <Loader2 className="mb-4 h-12 w-12 animate-spin text-purple-600" />
                    <p className="text-sm font-medium text-gray-600">Loading dashboard…</p>
                </div>
            </AdminLayout>
        );
    }

    const statCards = [
        {
            label: 'Total users',
            value: stats?.total_users,
            href: '/admin/users',
            linkLabel: 'Manage users',
            icon: Users,
            gradient: 'bg-blue-400',
            iconBg: 'bg-blue-50',
            iconColor: 'text-blue-600',
        },
        {
            label: 'Recruiters',
            value: stats?.total_recruiters,
            href: '/admin/users?role=recruiter',
            linkLabel: 'View recruiters',
            icon: UserPlus,
            gradient: 'bg-sky-400',
            iconBg: 'bg-sky-50',
            iconColor: 'text-sky-600',
        },
        {
            label: 'Admins',
            value: stats?.total_admins,
            href: '/admin/users?role=admin',
            linkLabel: 'View admins',
            icon: Shield,
            gradient: 'bg-violet-400',
            iconBg: 'bg-violet-50',
            iconColor: 'text-violet-600',
        },
        {
            label: 'Templates',
            value: stats?.total_templates,
            href: '/admin/templates',
            linkLabel: 'Manage templates',
            icon: Layout,
            gradient: 'bg-pink-400',
            iconBg: 'bg-pink-50',
            iconColor: 'text-pink-600',
        },
        {
            label: 'Resumes',
            value: stats?.total_resumes,
            subtext: 'Total created',
            icon: FileText,
            gradient: 'bg-emerald-400',
            iconBg: 'bg-emerald-50',
            iconColor: 'text-emerald-600',
        },
        {
            label: 'Cover letters',
            value: stats?.total_cover_letters,
            href: '/admin/cover-letters',
            linkLabel: 'View generated',
            icon: Mail,
            gradient: 'bg-amber-400',
            iconBg: 'bg-amber-50',
            iconColor: 'text-amber-600',
        },
        {
            label: 'Work certificates',
            value: stats?.total_work_certificates,
            href: '/admin/work-certificates',
            linkLabel: 'Manage certificates',
            icon: ScrollText,
            gradient: 'bg-indigo-400',
            iconBg: 'bg-indigo-50',
            iconColor: 'text-indigo-600',
        },
    ];

    return (
        <AdminLayout>
            <div className="space-y-8 pb-4">
                {/* Hero */}
                <section className="relative overflow-hidden rounded-3xl border border-purple-100/80 bg-gradient-to-br from-purple-600 via-violet-600 to-pink-600 p-6 text-white shadow-xl shadow-purple-200/40 md:p-8">
                    <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" aria-hidden />
                    <div className="pointer-events-none absolute -bottom-16 left-1/3 h-40 w-40 rounded-full bg-pink-400/30 blur-3xl" aria-hidden />
                    <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                                <Sparkles className="h-3.5 w-3.5" />
                                Admin overview
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                                {greeting}
                                {user?.name ? `, ${user.name.split(' ')[0]}` : ''}
                            </h1>
                            <p className="mt-2 max-w-xl text-sm text-white/85 md:text-base">
                                Monitor users, content, and platform activity from one place.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                                <p className="text-xs font-medium text-white/70">Active (7 days)</p>
                                <p className="text-2xl font-bold tabular-nums">{stats?.active_users_7d ?? 0}</p>
                            </div>
                            <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                                <p className="text-xs font-medium text-white/70">This month</p>
                                <p className="text-2xl font-bold tabular-nums">
                                    {(stats?.cover_letters_this_month ?? 0) + (stats?.work_certificates_this_month ?? 0)}
                                </p>
                                <p className="text-[10px] text-white/60">CL + certificates</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => fetchStats(true)}
                                disabled={isRefreshing}
                                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-purple-700 shadow-lg transition hover:bg-purple-50 disabled:opacity-70"
                            >
                                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                        </div>
                    </div>
                </section>

                {/* KPI grid */}
                <section>
                    <div className="mb-4 flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-purple-600" />
                        <h2 className="text-lg font-bold text-gray-900">Key metrics</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                        {statCards.map((card, i) => (
                            <StatCard key={card.label} {...card} delay={i * 40} />
                        ))}
                    </div>
                </section>

                {/* Activity + Quick actions */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                    <section className="lg:col-span-3 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm ring-1 ring-gray-100/80">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
                                <Activity className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Engagement</h2>
                                <p className="text-sm text-gray-500">Activity relative to your user base</p>
                            </div>
                        </div>
                        <div className="space-y-5">
                            <ActivityMeter
                                label="Active users (24h)"
                                value={stats?.active_users_24h ?? 0}
                                max={activityMax}
                                accentClass="bg-gradient-to-r from-purple-500 to-violet-500"
                            />
                            <ActivityMeter
                                label="Active users (7d)"
                                value={stats?.active_users_7d ?? 0}
                                max={activityMax}
                                accentClass="bg-gradient-to-r from-pink-500 to-rose-500"
                            />
                            <ActivityMeter
                                label="Cover letters this month"
                                value={stats?.cover_letters_this_month ?? 0}
                                max={Math.max(stats?.total_cover_letters || 1, stats?.cover_letters_this_month || 0)}
                                accentClass="bg-gradient-to-r from-amber-400 to-orange-500"
                            />
                            <ActivityMeter
                                label="Work certificates this month"
                                value={stats?.work_certificates_this_month ?? 0}
                                max={Math.max(stats?.total_work_certificates || 1, stats?.work_certificates_this_month || 0)}
                                accentClass="bg-gradient-to-r from-indigo-500 to-blue-500"
                            />
                        </div>
                        <div className="mt-6 flex flex-wrap gap-4 rounded-xl bg-gray-50 p-4 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span>
                                    <strong className="text-gray-900">{stats?.total_users ?? 0}</strong> registered users
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <TrendingUp className="h-4 w-4 text-emerald-500" />
                                <span>
                                    <strong className="text-gray-900">{stats?.total_resumes ?? 0}</strong> resumes built
                                </span>
                            </div>
                        </div>
                    </section>

                    <section className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm ring-1 ring-gray-100/80">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50">
                                <Sparkles className="h-5 w-5 text-pink-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Quick actions</h2>
                                <p className="text-sm text-gray-500">Jump to common admin tasks</p>
                            </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-1">
                            <QuickActionCard
                                to="/admin/users"
                                icon={Users}
                                title="Manage users"
                                description="Accounts, roles, and recruiters"
                                variant="primary"
                            />
                            <QuickActionCard
                                to="/admin/templates"
                                icon={Layout}
                                title="Resume templates"
                                description="Edit and publish CV layouts"
                            />
                            <QuickActionCard
                                to="/admin/blog"
                                icon={PenLine}
                                title="Blog posts"
                                description="Create and publish articles"
                            />
                            <QuickActionCard
                                to="/admin/cover-letters"
                                icon={Mail}
                                title="Generated cover letters"
                                description="Browse user-generated letters"
                            />
                            <QuickActionCard
                                to="/admin/work-certificates"
                                icon={ScrollText}
                                title="Work certificates"
                                description="Review employment certificates"
                                variant="soft"
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <QuickActionCard
                                    to="/admin/reviews"
                                    icon={MessageSquare}
                                    title="Reviews"
                                    description="Moderate feedback"
                                />
                                <QuickActionCard
                                    to="/admin/fonts"
                                    icon={Type}
                                    title="Fonts"
                                    description="PDF typography"
                                />
                            </div>
                        </div>
                    </section>
                </div>

                {/* Recent activity */}
                <section>
                    <div className="mb-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-gray-500" />
                            <h2 className="text-lg font-bold text-gray-900">Recent activity</h2>
                        </div>
                        <p className="text-sm text-gray-500">Latest signups and content</p>
                    </div>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                        <RecentSection
                            title="Users"
                            icon={Users}
                            iconClass="bg-blue-50 text-blue-600"
                            viewAllHref="/admin/users"
                            viewAllClass="text-blue-600"
                            emptyMessage="No recent users"
                        >
                            {stats?.recent_users?.map((u) => (
                                <RecentUserRow key={u.id} user={u} formatDate={formatDate} />
                            ))}
                        </RecentSection>

                        <RecentSection
                            title="Templates"
                            icon={Layout}
                            iconClass="bg-pink-50 text-pink-600"
                            viewAllHref="/admin/templates"
                            viewAllClass="text-pink-600"
                            emptyMessage="No recent templates"
                        >
                            {stats?.recent_templates?.map((template) => (
                                <li key={template.id}>
                                    <div className="rounded-xl border border-transparent p-3 transition-colors hover:border-pink-100 hover:bg-pink-50/40">
                                        <p className="font-semibold text-gray-900">{template.name}</p>
                                        <div className="mt-1 flex items-center justify-between gap-2">
                                            <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                                                {template.category || 'General'}
                                            </span>
                                            <time className="text-xs text-gray-400">{formatDate(template.created_at)}</time>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </RecentSection>

                        <RecentSection
                            title="Cover letters"
                            icon={Mail}
                            iconClass="bg-amber-50 text-amber-600"
                            viewAllHref="/admin/cover-letters"
                            viewAllClass="text-amber-600"
                            emptyMessage="No generated cover letters"
                        >
                            {stats?.recent_cover_letters?.map((letter) => (
                                <li key={letter.id}>
                                    <div className="rounded-xl border border-transparent p-3 transition-colors hover:border-amber-100 hover:bg-amber-50/40">
                                        <p className="font-semibold text-gray-900 line-clamp-1">{letter.title}</p>
                                        <p className="mt-1 text-xs text-gray-500">
                                            {letter.user?.name || 'Unknown'} · {letter.style || 'classic'}
                                        </p>
                                        <time className="mt-1 block text-xs text-gray-400">{formatDate(letter.created_at)}</time>
                                    </div>
                                </li>
                            ))}
                        </RecentSection>

                        <RecentSection
                            title="Work certificates"
                            icon={ScrollText}
                            iconClass="bg-indigo-50 text-indigo-600"
                            viewAllHref="/admin/work-certificates"
                            viewAllClass="text-indigo-600"
                            emptyMessage="No work certificates yet"
                        >
                            {stats?.recent_work_certificates?.map((cert) => (
                                <li key={cert.id}>
                                    <div className="rounded-xl border border-transparent p-3 transition-colors hover:border-indigo-100 hover:bg-indigo-50/40">
                                        <p className="font-semibold text-gray-900 line-clamp-1">{cert.title}</p>
                                        <p className="mt-1 text-xs text-gray-500">
                                            {cert.user?.name || 'Unknown'} · {cert.company_name}
                                        </p>
                                        <time className="mt-1 block text-xs text-gray-400">{formatDate(cert.created_at)}</time>
                                    </div>
                                </li>
                            ))}
                        </RecentSection>
                    </div>
                </section>
            </div>
        </AdminLayout>
    );
}
