
import React, { useMemo, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { CustomerSelection } from '../types';
import { useNavigate } from 'react-router-dom';

const QRIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M3,3H9V9H3V3M5,5V7H7V5H5M3,15H9V21H3V15M5,17V19H7V17H5M15,3H21V9H15V3M17,5V7H19V5H17M13,13H15V15H13V13M15,15H17V17H15V15M17,17H19V19H17V17M19,19H21V21H19V19M15,19H17V21H15V19M13,17H15V19H13V17M13,15H15V17H13V15M17,13H19V15H17V13M19,13H21V15H19V13M19,11H21V13H19V11M13,11H15V13H13V11M15,9H17V11H15V9M17,9H19V11H17V9M19,7H21V9H19V7M11,13H13V15H11V13M11,15H13V17H11V17M9,13H11V15H9V13M9,15H11V17H9V15M11,17H13V19H11V17M13,19H15V21H13V19M11,19H13V21H11V19M11,7H13V9H11V7M9,7H11V9H9V7M7,11H9V13H7V11M3,11H5V13H3V11M5,11H7V13H5V11M11,3H13V5H11V3M13,5H15V7H13V5Z" /></svg>
);

const QRCodeModal: React.FC<{ url: string, onClose: () => void }> = ({ url, onClose }) => {
    const { t } = useAppContext();
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[100]" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-2xl text-center max-w-sm w-full mx-4" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-white">{t('shareViaQRCode')}</h3>
                <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-lg inline-block">
                    <img src={qrApiUrl} alt="QR Code" width="200" height="200" className="mx-auto" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 break-all" dir="ltr">{url}</p>
                <button 
                    onClick={onClose} 
                    className="mt-6 w-full px-4 py-2 bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-700 transition-colors"
                >
                    {t('close')}
                </button>
            </div>
        </div>
    );
}

const ShareLink: React.FC = () => {
    const { t } = useAppContext();
    const [copied, setCopied] = useState(false);
    const [showQR, setShowQR] = useState(false);
    
    const selectionUrl = `${window.location.href.split('#')[0].replace(/\/$/, '')}/#/selection`;

    const handleCopy = () => {
        navigator.clipboard.writeText(selectionUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <>
            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">{t('shareLinkWithCustomer')}</h3>
                <div className="flex items-stretch gap-2 mt-2">
                    <input 
                        type="text" 
                        readOnly 
                        value={selectionUrl} 
                        className="w-full flex-1 p-2 bg-white dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600 text-sm"
                        dir="ltr"
                    />
                    <button 
                        onClick={handleCopy}
                        className="px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                        {copied ? t('linkCopied') : t('copyLink')}
                    </button>
                    <button 
                        onClick={() => setShowQR(true)}
                        aria-label={t('shareViaQRCode')}
                        title={t('shareViaQRCode')}
                        className="p-2 aspect-square text-sm font-medium rounded-md shadow-sm text-white bg-slate-600 hover:bg-slate-700 flex items-center justify-center"
                    >
                        <QRIcon />
                    </button>
                </div>
            </div>
            {showQR && <QRCodeModal url={selectionUrl} onClose={() => setShowQR(false)} />}
        </>
    );
};


const CustomerSelectionsListPage: React.FC = () => {
    const { customerSelections, processSelection, t, formatCurrency, formatDate, formatNumber, isUpdating } = useAppContext();
    const navigate = useNavigate();

    const pendingSelections = useMemo(() => {
        return customerSelections
            .filter(s => s.status === 'pending')
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }, [customerSelections]);

    const handleConvertToInvoice = async (selection: CustomerSelection) => {
        const success = await processSelection(selection.id);
        if (success) {
          navigate('/admin/new-order', { state: { selection } });
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">{t('customerSelections')}</h1>
                <p className="mt-1 text-slate-500 dark:text-slate-400">{t('customerSelectionsDescription')}</p>
            </div>

            <ShareLink />

            <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">{t('pendingSelections')}</h2>
                {pendingSelections.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        <h3 className="mt-4 text-lg font-medium text-slate-800 dark:text-white">{t('noPendingSelections')}</h3>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pendingSelections.map(selection => (
                            <div key={selection.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 sm:p-6">
                                <div className="flex justify-between items-start flex-wrap gap-4">
                                    <div>
                                        <h3 className="font-bold text-lg text-indigo-700 dark:text-indigo-400">{t('selectionFrom')} {selection.customerName}</h3>
                                        {selection.customerPhone && <p className="text-sm text-slate-500">{selection.customerPhone}</p>}
                                        <p className="text-xs text-slate-400 mt-1">{formatDate(selection.createdAt)}</p>
                                    </div>
                                    <button 
                                        onClick={() => handleConvertToInvoice(selection)}
                                        disabled={isUpdating}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-400"
                                    >
                                        {t('convertToInvoice')}
                                    </button>
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                    <ul className="space-y-2">
                                        {selection.items.map(item => (
                                            <li key={item.productId} className="flex justify-between items-center text-sm">
                                                <span className="font-medium text-slate-800 dark:text-slate-200">{item.name}</span>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-slate-500 dark:text-slate-400">
                                                        {formatNumber(item.quantity)} x {formatCurrency(item.price)}
                                                    </span>
                                                    <span className="font-semibold w-24 text-end">{formatCurrency(item.quantity * item.price)}</span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerSelectionsListPage;
