import React, { useState } from 'react';
import { Settings, Save, ShieldCheck, DollarSign, Truck, Store, CreditCard } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const AdminSettings: React.FC = () => {
  const { success } = useToast();

  const [storeName, setStoreName] = useState('BazaarNova');
  const [supportEmail, setSupportEmail] = useState('support@bazaarnova.com');
  const [supportPhone, setSupportPhone] = useState('+1 (800) 555-0199');
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [taxRate, setTaxRate] = useState(7.5);
  const [standardShipping, setStandardShipping] = useState(4.99);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(50.0);

  const [enablePayPal, setEnablePayPal] = useState(true);
  const [enablePayoneer, setEnablePayoneer] = useState(true);
  const [enableCreditCards, setEnableCreditCards] = useState(true);
  const [enableCOD, setEnableCOD] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    success('Settings Saved', 'Store configuration updated successfully');
  };

  return (
    <div className="max-w-4xl space-y-6 text-xs">
      <div>
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
          Store Engine Settings
        </h1>
        <p className="text-zinc-500">
          Global marketplace configurations, tax rates, shipping logistics, and payment integrations
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Marketplace Identity */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 space-y-4 shadow-xs">
          <h2 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <Store className="w-4 h-4 text-orange-500" />
            General Branding & Contact
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Store Title
              </label>
              <input
                type="text"
                value={storeName}
                onChange={e => setStoreName(e.target.value)}
                className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Support Email
              </label>
              <input
                type="email"
                value={supportEmail}
                onChange={e => setSupportEmail(e.target.value)}
                className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Helpdesk Phone
              </label>
              <input
                type="tel"
                value={supportPhone}
                onChange={e => setSupportPhone(e.target.value)}
                className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Shipping & Tax Logistics */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 space-y-4 shadow-xs">
          <h2 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <Truck className="w-4 h-4 text-orange-500" />
            Shipping & Tax Rules
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Standard Shipping Fee ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={standardShipping}
                onChange={e => setStandardShipping(Number(e.target.value))}
                className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Free Shipping Threshold ($)
              </label>
              <input
                type="number"
                step="1"
                value={freeShippingThreshold}
                onChange={e => setFreeShippingThreshold(Number(e.target.value))}
                className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Tax Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={taxRate}
                onChange={e => setTaxRate(Number(e.target.value))}
                className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Payment Gateways */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 space-y-4 shadow-xs">
          <h2 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <CreditCard className="w-4 h-4 text-orange-500" />
            Accepted Payment Methods
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <label className="flex items-center gap-2 font-bold cursor-pointer p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
              <input
                type="checkbox"
                checked={enablePayPal}
                onChange={e => setEnablePayPal(e.target.checked)}
                className="rounded text-orange-600"
              />
              <span>PayPal Express</span>
            </label>

            <label className="flex items-center gap-2 font-bold cursor-pointer p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
              <input
                type="checkbox"
                checked={enablePayoneer}
                onChange={e => setEnablePayoneer(e.target.checked)}
                className="rounded text-orange-600"
              />
              <span>Payoneer Escrow</span>
            </label>

            <label className="flex items-center gap-2 font-bold cursor-pointer p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
              <input
                type="checkbox"
                checked={enableCreditCards}
                onChange={e => setEnableCreditCards(e.target.checked)}
                className="rounded text-orange-600"
              />
              <span>Credit Cards</span>
            </label>

            <label className="flex items-center gap-2 font-bold cursor-pointer p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
              <input
                type="checkbox"
                checked={enableCOD}
                onChange={e => setEnableCOD(e.target.checked)}
                className="rounded text-orange-600"
              />
              <span>Cash on Delivery</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-md flex items-center gap-2 transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Save Store Configuration</span>
        </button>
      </form>
    </div>
  );
};
