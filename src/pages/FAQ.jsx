import { useState } from 'react';
import GuestLayout from "../Layouts/GuestLayout";
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function FAQ() {
  const { t } = useLanguage();
  const faq = t?.faq || {};
  const [openIndex, setOpenIndex] = useState(null);

  const questions = faq.questions || [];

  const toggleQuestion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <GuestLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-6">
              <HelpCircle className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {faq.title || "Frequently Asked Questions"}
            </h1>
            <p className="text-lg text-gray-600">
              {faq.subtitle || "Find answers to common questions about our resume builder service"}
            </p>
          </div>

          {/* FAQ Items */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {questions.length > 0 ? (
              questions.map((item, index) => (
                <div
                  key={index}
                  className={`border-b border-gray-200 last:border-b-0 transition-all duration-200 ${
                    openIndex === index ? 'bg-gray-50' : ''
                  }`}
                >
                  <button
                    onClick={() => toggleQuestion(index)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                  >
                    <span className="text-lg font-semibold text-gray-900 pr-4">
                      {item.question || `Question ${index + 1}`}
                    </span>
                    {openIndex === index ? (
                      <ChevronUp className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      openIndex === index ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-6 pb-5 text-gray-700 leading-relaxed">
                      {typeof item.answer === 'string' ? (
                        <p>{item.answer}</p>
                      ) : (
                        <div className="space-y-2">
                          {Array.isArray(item.answer) ? (
                            item.answer.map((paragraph, pIndex) => (
                              <p key={pIndex}>{paragraph}</p>
                            ))
                          ) : (
                            <p>{item.answer}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <p>{faq.noQuestions || "No questions available at the moment."}</p>
              </div>
            )}
          </div>

          {/* Contact Section */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              {faq.contact?.title || "Still have questions?"}
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {faq.contact?.content || "If you can't find the answer you're looking for, feel free to reach out to our support team."}
            </p>
            <p className="text-gray-700 font-semibold">
              {faq.contact?.email || "Email: support@hresume.com"}
            </p>
          </div>
        </div>
      </div>
    </GuestLayout>
  );
}

