import { Link } from 'react-router-dom';
import GuestLayout from '../Layouts/GuestLayout';
import { useLanguage } from '../context/LanguageContext';
import {
  Scale,
  FileText,
  User,
  Shield,
  Sparkles,
  CreditCard,
  Lock,
  AlertTriangle,
  Gavel,
  Mail,
} from 'lucide-react';

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

function BulletList({ items }) {
  return (
    <ul className="list-disc list-inside space-y-2 text-gray-700">
      {items.map((point, i) => (
        <li key={i}>{point}</li>
      ))}
    </ul>
  );
}

export default function TermsOfService() {
  const { t } = useLanguage();
  const terms = t?.terms || {};

  return (
    <GuestLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-6">
              <Scale className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {terms.title || 'Terms and Conditions'}
            </h1>
            <p className="text-lg text-gray-600">
              {terms.lastUpdated || 'Last updated:'}{' '}
              {terms.lastUpdatedDate || 'May 2026'}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 space-y-10">
            <Section icon={FileText}>
              <h2 className="text-2xl font-bold text-gray-900">
                {terms.introduction?.title || 'Agreement'}
              </h2>
              <p className="text-gray-700 leading-relaxed">{terms.introduction?.content}</p>
            </Section>

            <Section icon={Scale}>
              <h2 className="text-2xl font-bold text-gray-900">
                {terms.service?.title || 'The service'}
              </h2>
              <p className="text-gray-700 leading-relaxed">{terms.service?.content}</p>
            </Section>

            <Section icon={User}>
              <h2 className="text-2xl font-bold text-gray-900">
                {terms.accounts?.title || 'Accounts'}
              </h2>
              <BulletList items={terms.accounts?.points || []} />
            </Section>

            <Section icon={Shield}>
              <h2 className="text-2xl font-bold text-gray-900">
                {terms.acceptableUse?.title || 'Acceptable use'}
              </h2>
              {terms.acceptableUse?.intro && (
                <p className="text-gray-700 leading-relaxed">{terms.acceptableUse.intro}</p>
              )}
              <BulletList items={terms.acceptableUse?.points || []} />
            </Section>

            <Section icon={FileText}>
              <h2 className="text-2xl font-bold text-gray-900">
                {terms.content?.title || 'Your content'}
              </h2>
              <p className="text-gray-700 leading-relaxed">{terms.content?.content}</p>
            </Section>

            <Section icon={Sparkles}>
              <h2 className="text-2xl font-bold text-gray-900">
                {terms.ai?.title || 'AI features'}
              </h2>
              <p className="text-gray-700 leading-relaxed">{terms.ai?.content}</p>
            </Section>

            <Section icon={CreditCard}>
              <h2 className="text-2xl font-bold text-gray-900">
                {terms.payments?.title || 'Paid plans'}
              </h2>
              <p className="text-gray-700 leading-relaxed">{terms.payments?.content}</p>
              <p className="text-sm text-gray-600">
                <Link to="/pricing" className="text-blue-600 hover:underline font-medium">
                  Pricing
                </Link>
                {' · '}
                <Link to="/refund" className="text-blue-600 hover:underline font-medium">
                  {terms.contact?.refundLink || 'Refund Policy'}
                </Link>
              </p>
            </Section>

            <Section icon={Lock}>
              <h2 className="text-2xl font-bold text-gray-900">
                {terms.privacy?.title || 'Privacy'}
              </h2>
              <p className="text-gray-700 leading-relaxed">{terms.privacy?.content}</p>
              <p className="text-sm">
                <Link to="/privacy" className="text-blue-600 hover:underline font-medium">
                  {terms.contact?.privacyLink || 'Privacy Policy'}
                </Link>
              </p>
            </Section>

            <Section icon={AlertTriangle}>
              <h2 className="text-2xl font-bold text-gray-900">
                {terms.disclaimer?.title || 'Disclaimer'}
              </h2>
              <p className="text-gray-700 leading-relaxed">{terms.disclaimer?.content}</p>
            </Section>

            <Section icon={Gavel}>
              <h2 className="text-2xl font-bold text-gray-900">
                {terms.liability?.title || 'Limitation of liability'}
              </h2>
              <p className="text-gray-700 leading-relaxed">{terms.liability?.content}</p>
            </Section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {terms.termination?.title || 'Termination'}
              </h2>
              <p className="text-gray-700 leading-relaxed">{terms.termination?.content}</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {terms.law?.title || 'Governing law'}
              </h2>
              <p className="text-gray-700 leading-relaxed">{terms.law?.content}</p>
            </section>

            <section className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
              <div className="flex items-start gap-3">
                <Mail className="h-6 w-6 text-blue-600 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    {terms.contact?.title || 'Contact'}
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">{terms.contact?.content}</p>
                  <p className="text-gray-700 font-semibold">
                    <a href="mailto:contact@hresume.pro" className="text-blue-600 hover:underline">
                      contact@hresume.pro
                    </a>
                  </p>
                  <p className="mt-4 text-sm text-gray-600">
                    <Link to="/contact" className="text-blue-600 hover:underline font-medium">
                      {terms.contact?.formLink || 'Contact form'}
                    </Link>
                    {' · '}
                    <Link to="/privacy" className="text-blue-600 hover:underline font-medium">
                      {terms.contact?.privacyLink || 'Privacy'}
                    </Link>
                    {' · '}
                    <Link to="/refund" className="text-blue-600 hover:underline font-medium">
                      {terms.contact?.refundLink || 'Refunds'}
                    </Link>
                  </p>
                </div>
              </div>
            </section>

            <section className="border-t border-gray-200 pt-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {terms.changes?.title || 'Changes'}
              </h2>
              <p className="text-gray-700 leading-relaxed">{terms.changes?.content}</p>
            </section>
          </div>
        </div>
      </div>
    </GuestLayout>
  );
}
