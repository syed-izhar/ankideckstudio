import React from 'react';
import { HelpCircle } from 'lucide-react';

export default function FaqSection({ faqs, title = 'Frequently Asked Questions' }) {
  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="my-10 rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
      <div className="flex items-center gap-2.5 mb-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
          <HelpCircle className="w-5 h-5" />
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
          {title}
        </h2>
      </div>

      <dl className="space-y-6 divide-y divide-gray-100">
        {faqs.map((f, i) => (
          <div key={i} className={i > 0 ? 'pt-6' : ''}>
            <dt className="text-base font-bold text-gray-900 mb-2">
              {f.question}
            </dt>
            <dd className="text-sm text-gray-600 leading-relaxed">
              {f.answer}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
