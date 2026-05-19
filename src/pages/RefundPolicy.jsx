import { Link } from 'react-router-dom';
import GuestLayout from '../Layouts/GuestLayout';
import { useLanguage } from '../context/LanguageContext';
import { RotateCcw, CreditCard, Clock, Ban, Mail, FileText } from 'lucide-react';

function Section({ icon: Icon, children }) {
  return (
    <section>
      <div className="flex items-start gap-4">
        <Icon className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
        <div className="space-y-3">{children}</div>
      </div>
    </section>
  );
}

export default function RefundPolicy() {
  const { t } = useLanguage();
  const refund = t?.refund || {};

  return (
    <GuestLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-6">
              <RotateCcw className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {refund.title || 'Refund Policy'}
            </h1>
            <p className="text-lg text-gray-600">
              {refund.lastUpdated || 'Last updated:'}{' '}
              {refund.lastUpdatedDate || 'May 2026'}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 space-y-10">
            <Section icon={FileText}>
              <h2 className="text-2xl font-bold text-gray-900">
                {refund.introduction?.title || 'Introduction'}
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {refund.introduction?.content ||
                  'This Refund Policy explains how refunds work for HResume Pro and related paid services. The free plan does not involve charges and is not eligible for refunds.'}
              </p>
            </Section>

            <Section icon={CreditCard}>
              <h2 className="text-2xl font-bold text-gray-900">
                {refund.eligibility?.title || 'Refund eligibility'}
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {refund.eligibility?.intro ||
                  'We want you to be satisfied with HResume Pro. Refunds may be available under the conditions below.'}
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {(refund.eligibility?.points || [
                  'First-time Pro subscription: you may request a full refund within 14 days of your initial payment if you have not substantially used Pro features (e.g. unlimited AI beyond a reasonable trial).',
                  'Billing errors or duplicate charges: contact us within 30 days and we will correct or refund the charge.',
                  'Renewals: subscription renewals are generally non-refundable except where required by law or at our discretion for exceptional cases.',
                ]).map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </Section>

            <Section icon={Clock}>
              <h2 className="text-2xl font-bold text-gray-900">
                {refund.howToRequest?.title || 'How to request a refund'}
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {refund.howToRequest?.content ||
                  'To request a refund, email us from the address linked to your HResume account.'}
              </p>
              <ul className="list-decimal list-inside space-y-2 text-gray-700">
                {(refund.howToRequest?.steps || [
                  'Send an email to contact@hresume.pro with the subject "Refund request".',
                  'Include your account email, payment date, and reason for the request.',
                  'We will review your request and respond within 5–10 business days.',
                ]).map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            </Section>

            <Section icon={Ban}>
              <h2 className="text-2xl font-bold text-gray-900">
                {refund.nonRefundable?.title || 'Non-refundable situations'}
              </h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {(refund.nonRefundable?.points || [
                  'Free plan usage (no payment was made).',
                  'Pro access granted manually by our team without a charge.',
                  'Requests made more than 14 days after the initial Pro payment (except billing errors).',
                  'Account termination due to violation of our terms or abuse of the service.',
                ]).map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </Section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {refund.cancellations?.title || 'Cancellations'}
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {refund.cancellations?.content ||
                  'You may cancel Pro at any time. Cancellation stops future renewals; you keep Pro until the end of the current billing period. Canceling does not automatically issue a refund for the current period unless eligible under this policy.'}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {refund.paddle?.title || 'International payments (Paddle)'}
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {refund.paddle?.content ||
                  'International Pro subscriptions are processed by Paddle as merchant of record. Refunds for eligible requests are issued through Paddle to your original payment method. Processing times depend on your bank or card issuer (typically 5–14 business days after approval).'}
              </p>
            </section>

            <section className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
              <div className="flex items-start gap-3">
                <Mail className="h-6 w-6 text-blue-600 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    {refund.contact?.title || 'Contact us'}
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {refund.contact?.content ||
                      'Questions about refunds or billing? We are happy to help.'}
                  </p>
                  <p className="text-gray-700 font-semibold">
                    <a href="mailto:contact@hresume.pro" className="text-blue-600 hover:underline">
                      contact@hresume.pro
                    </a>
                  </p>
                  <p className="mt-4 text-sm text-gray-600">
                    <Link to="/contact" className="text-blue-600 hover:underline font-medium">
                      {refund.contact?.formLink || 'Contact form'}
                    </Link>
                    {' · '}
                    <Link to="/pricing" className="text-blue-600 hover:underline font-medium">
                      {refund.contact?.pricingLink || 'Pricing'}
                    </Link>
                  </p>
                </div>
              </div>
            </section>

            <section className="border-t border-gray-200 pt-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {refund.changes?.title || 'Changes to this policy'}
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {refund.changes?.content ||
                  'We may update this Refund Policy from time to time. Changes are effective when posted on this page with an updated date.'}
              </p>
            </section>
          </div>
        </div>
      </div>
    </GuestLayout>
  );
}
