import GuestLayout from "../Layouts/GuestLayout";
import { ShieldCheck, Lock, Eye, FileText, Users, Database, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function PrivacyPolicy() {
  const { t } = useLanguage();
  const privacy = t?.privacy || {};

  return (
    <GuestLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-6">
              <ShieldCheck className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {privacy.title || "Privacy Policy"}
            </h1>
            <p className="text-lg text-gray-600">
              {privacy.lastUpdated || "Last updated: "} {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 space-y-8">
            {/* Introduction */}
            <section>
              <div className="flex items-start gap-4 mb-4">
                <FileText className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    {privacy.introduction?.title || "Introduction"}
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    {privacy.introduction?.content || "At HResume, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our resume builder service."}
                  </p>
                </div>
              </div>
            </section>

            {/* Information We Collect */}
            <section>
              <div className="flex items-start gap-4 mb-4">
                <Database className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    {privacy.informationWeCollect?.title || "Information We Collect"}
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        {privacy.informationWeCollect?.personalData?.title || "Personal Information"}
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {privacy.informationWeCollect?.personalData?.content || "We collect information that you provide directly to us, including your name, email address, phone number, and any other information you choose to include in your resume."}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        {privacy.informationWeCollect?.usageData?.title || "Usage Data"}
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {privacy.informationWeCollect?.usageData?.content || "We automatically collect certain information about your device and how you interact with our service, including IP address, browser type, pages visited, and time spent on pages."}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        {privacy.informationWeCollect?.cookies?.title || "Cookies and Tracking"}
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {privacy.informationWeCollect?.cookies?.content || "We use cookies and similar tracking technologies to enhance your experience, analyze usage patterns, and assist in our marketing efforts."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* How We Use Your Information */}
            <section>
              <div className="flex items-start gap-4 mb-4">
                <Eye className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    {privacy.howWeUse?.title || "How We Use Your Information"}
                  </h2>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 leading-relaxed ml-4">
                    {privacy.howWeUse?.points ? (
                      privacy.howWeUse.points.map((point, index) => (
                        <li key={index}>{point}</li>
                      ))
                    ) : (
                      <>
                        <li>To provide, maintain, and improve our resume builder service</li>
                        <li>To process your requests and transactions</li>
                        <li>To send you technical notices, updates, and support messages</li>
                        <li>To respond to your comments, questions, and requests</li>
                        <li>To monitor and analyze trends, usage, and activities</li>
                        <li>To detect, prevent, and address technical issues and security threats</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </section>

            {/* Data Sharing */}
            <section>
              <div className="flex items-start gap-4 mb-4">
                <Users className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    {privacy.dataSharing?.title || "Data Sharing and Disclosure"}
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {privacy.dataSharing?.intro || "We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:"}
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 leading-relaxed ml-4">
                    {privacy.dataSharing?.circumstances ? (
                      privacy.dataSharing.circumstances.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))
                    ) : (
                      <>
                        <li>With your explicit consent</li>
                        <li>To comply with legal obligations or respond to legal requests</li>
                        <li>To protect our rights, privacy, safety, or property</li>
                        <li>With service providers who assist us in operating our platform (under strict confidentiality agreements)</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </section>

            {/* Data Security */}
            <section>
              <div className="flex items-start gap-4 mb-4">
                <Lock className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    {privacy.dataSecurity?.title || "Data Security"}
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    {privacy.dataSecurity?.content || "We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security."}
                  </p>
                </div>
              </div>
            </section>

            {/* Your Rights */}
            <section>
              <div className="flex items-start gap-4 mb-4">
                <Globe className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    {privacy.yourRights?.title || "Your Rights"}
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {privacy.yourRights?.intro || "You have the right to:"}
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 leading-relaxed ml-4">
                    {privacy.yourRights?.rights ? (
                      privacy.yourRights.rights.map((right, index) => (
                        <li key={index}>{right}</li>
                      ))
                    ) : (
                      <>
                        <li>Access and receive a copy of your personal data</li>
                        <li>Rectify inaccurate or incomplete data</li>
                        <li>Request deletion of your personal data</li>
                        <li>Object to processing of your personal data</li>
                        <li>Request restriction of processing</li>
                        <li>Data portability (receive your data in a structured format)</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </section>

            {/* Contact Us */}
            <section>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  {privacy.contact?.title || "Contact Us"}
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {privacy.contact?.content || "If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us at:"}
                </p>
                <p className="text-gray-700 font-semibold">
                  {privacy.contact?.email || "Email: privacy@hresume.com"}
                </p>
              </div>
            </section>

            {/* Changes to This Policy */}
            <section>
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  {privacy.changes?.title || "Changes to This Privacy Policy"}
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {privacy.changes?.content || "We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the 'Last updated' date. You are advised to review this Privacy Policy periodically for any changes."}
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </GuestLayout>
  );
}

