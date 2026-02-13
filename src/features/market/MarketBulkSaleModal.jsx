import React from 'react';

export default function MarketBulkSaleModal({
    pendingBulkSale,
    formatGold,
    handleCancelBulkSale,
    handleConfirmBulkSale,
    skipBulkConfirm,
    setSkipBulkConfirm,
}) {
    if (!pendingBulkSale) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl border border-yellow-700/30 bg-gray-950 p-6 shadow-2xl">
                <h3 className="text-xl font-bold text-white">Bulk Sale Confirmation</h3>
                <p className="mt-2 text-sm text-gray-300">
                    Values are estimated. Market fluctuations may apply.
                </p>

                <div className="mt-4 rounded-xl border border-yellow-700/20 bg-gray-900/50 p-4">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Items to sell:</span>
                        <span className="font-medium text-white">{pendingBulkSale.totalCount}</span>
                    </div>
                    <div className="mt-2 flex justify-between text-sm">
                        <span className="text-gray-400">Total Value:</span>
                        <span className="font-bold text-yellow-400">{formatGold(pendingBulkSale.totalValue)}g</span>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                        Selling all {pendingBulkSale.label}
                    </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="skipConfirm"
                        checked={skipBulkConfirm}
                        onChange={(e) => setSkipBulkConfirm(e.target.checked)}
                        className="rounded border-gray-600 bg-gray-800 text-yellow-500 focus:ring-yellow-500"
                    />
                    <label htmlFor="skipConfirm" className="text-xs text-gray-400">
                        Don't ask me again (can be reset in settings)
                    </label>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={handleCancelBulkSale}
                        className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-300 hover:bg-white/5"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirmBulkSale}
                        className="rounded-lg bg-yellow-600/20 px-4 py-2 text-sm font-semibold text-yellow-200 border border-yellow-600/30 hover:bg-yellow-600/30"
                    >
                        Confirm Sale
                    </button>
                </div>
            </div>
        </div>
    );
}
