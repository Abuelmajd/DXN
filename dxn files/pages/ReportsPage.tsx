import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Order, Expense } from '../types';

interface FinancialStats {
    totalRevenue: number;
    totalExpenses: number;
}

const calculateStats = (orders: Order[], expenses: Expense[], startDate: Date, endDate: Date): FinancialStats => {
    const relevantOrders = orders.filter(o => o.createdAt >= startDate && o.createdAt <= endDate);
    const relevantExpenses = expenses.filter(e => e.date >= startDate && e.date <= endDate);

    const totalRevenue = relevantOrders.reduce((sum, order) => sum + order.totalPrice, 0);
    const totalExpenses = relevantExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    return { totalRevenue, totalExpenses };
};

const StatRow: React.FC<{ label: string, value: string, colorClass?: string }> = ({ label, value, colorClass = "text-slate-900 dark:text-white" }) => (
    <div className="flex justify-between items-center py-3">
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</span>
        <span className={`text-lg font-bold ${colorClass}`}>{value}</span>
    </div>
);

const ReportCard: React.FC<{ title: string, stats: FinancialStats }> = ({ title, stats }) => {
    const { t, formatCurrency } = useAppContext();

    if(stats.totalRevenue === 0 && stats.totalExpenses === 0) {
        return (
             <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                 <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">{title}</h3>
                 <p className="text-center text-slate-500 py-8">{t('noDataForPeriod')}</p>
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{title}</h3>
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
                <StatRow label={t('totalRevenue')} value={formatCurrency(stats.totalRevenue)} colorClass="text-green-600 dark:text-green-400" />
                <StatRow label={t('totalExpenses')} value={formatCurrency(stats.totalExpenses)} colorClass="text-red-600 dark:text-red-400" />
            </div>
        </div>
    );
};


const ReportsPage: React.FC = () => {
    const { orders, expenses, t } = useAppContext();

    const reports = useMemo(() => {
        const now = new Date();
        
        const todayStart = new Date(now.setHours(0, 0, 0, 0));
        const todayEnd = new Date(now.setHours(23, 59, 59, 999));

        const weekStart = new Date(todayStart);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Assuming Sunday is start of week

        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const yearStart = new Date(now.getFullYear(), 0, 1);
        
        return {
            daily: calculateStats(orders, expenses, todayStart, todayEnd),
            weekly: calculateStats(orders, expenses, weekStart, now),
            monthly: calculateStats(orders, expenses, monthStart, now),
            yearly: calculateStats(orders, expenses, yearStart, now),
        }
    }, [orders, expenses]);


    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">{t('reports')}</h1>
                <p className="mt-1 text-slate-500 dark:text-slate-400">{t('financialSummary')}</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ReportCard title={t('dailyReport')} stats={reports.daily} />
                <ReportCard title={t('weeklyReport')} stats={reports.weekly} />
                <ReportCard title={t('monthlyReport')} stats={reports.monthly} />
                <ReportCard title={t('yearlyReport')} stats={reports.yearly} />
            </div>
        </div>
    );
};

export default ReportsPage;