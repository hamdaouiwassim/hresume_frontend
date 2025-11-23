import React from "react";
import { useLanguage } from "../context/LanguageContext";

const ResumeTemplatePreview = ({ resume = {} }) => {
  const { t } = useLanguage();
  const labels = t?.preview || {};

  const contact = resume.contact || {};
  const experience = resume.experience || [];
  const education = resume.education || [];
  const skills = resume.skills || [];
  const interests = resume.interests || [];
  const certifications = resume.certifications || [];
  const languages = resume.languages || [];

  const contactLine = [
    contact.location,
    contact.email,
    contact.phone,
    contact.linkedin,
    contact.website,
  ].filter(Boolean);

  return (
    <div className="pdf-template-preview" data-cv-preview="true">
      <style>
        {`
          .pdf-template-preview {
            font-family: 'Inter', 'DejaVu Sans', 'Helvetica Neue', Arial, sans-serif;
            background: #ffffff;
            padding: 12px 16px 16px;
            color: #111;
            line-height: 1.5;
          }
          @media (min-width: 640px) {
            .pdf-template-preview {
              padding: 18px 24px 24px;
            }
          }
          .pdf-template-preview * {
            box-sizing: border-box;
          }
          .pdf-template-preview h1 {
            font-size: 24px;
            letter-spacing: 0.08em;
            text-align: center;
            margin: 0 0 6px;
          }
          @media (min-width: 640px) {
            .pdf-template-preview h1 {
              font-size: 32px;
            }
          }
          .pdf-template-preview .tagline {
            text-align: center;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            margin: 0 0 4px;
          }
          @media (min-width: 640px) {
            .pdf-template-preview .tagline {
              font-size: 14px;
            }
          }
          .pdf-template-preview .contact-line {
            text-align: center;
            font-size: 10px;
            color: #374151;
            margin: 0 0 20px;
          }
          @media (min-width: 640px) {
            .pdf-template-preview .contact-line {
              font-size: 12px;
            }
          }
          .pdf-template-preview h2 {
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            border-bottom: 2px solid #111;
            margin: 26px 0 12px;
            padding-bottom: 6px;
          }
          @media (min-width: 640px) {
            .pdf-template-preview h2 {
              font-size: 15px;
            }
          }
          .pdf-template-preview h3 {
            font-size: 12px;
            font-weight: 700;
            margin: 0;
          }
          @media (min-width: 640px) {
            .pdf-template-preview h3 {
              font-size: 14px;
            }
          }
          .pdf-template-preview .subheading {
            font-size: 11px;
            font-weight: 600;
            color: #374151;
            margin: 0;
          }
          @media (min-width: 640px) {
            .pdf-template-preview .subheading {
              font-size: 12px;
            }
          }
          .pdf-template-preview p {
            font-size: 12px;
          }
          @media (min-width: 640px) {
            .pdf-template-preview p {
              font-size: 14px;
            }
          }
          .pdf-template-preview ul li {
            font-size: 12px;
          }
          @media (min-width: 640px) {
            .pdf-template-preview ul li {
              font-size: 14px;
            }
          }
          .pdf-template-preview ul {
            margin: 8px 0 12px 18px;
            padding: 0;
          }
          .pdf-template-preview ul li {
            margin-bottom: 4px;
          }
          .pdf-template-preview .role-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 12px;
            margin-bottom: 6px;
          }
          .pdf-template-preview .section {
            margin-bottom: 12px;
          }
          .pdf-template-preview .list-simple {
            margin-left: 14px;
          }
        `}
      </style>
      {resume.name && <h1>{resume.name.toUpperCase()}</h1>}
      {resume.tagline && <p className="tagline">{resume.tagline}</p>}
      {contactLine.length > 0 && (
        <p className="contact-line">{contactLine.join(" | ")}</p>
      )}

      {resume.summary && (
        <>
          <h2>{labels.professionalSummary || "Professional Summary"}</h2>
          <p>{resume.summary}</p>
        </>
      )}

      {experience.length > 0 && (
        <>
          <h2>{labels.workExperience || "Work Experience"}</h2>
          {experience.map((role, idx) => (
            <div className="section" key={`exp-${idx}`}>
              <div className="role-row">
                <div>
                  {role.title && <h3>{role.title}</h3>}
                  {(role.company || role.location) && (
                    <p className="subheading">
                      {role.company}
                      {role.company && role.location ? ", " : ""}
                      {role.location}
                    </p>
                  )}
                </div>
                {(role.start || role.end) && (
                  <p className="subheading">
                    {role.start}
                    {role.start && role.end ? " – " : ""}
                    {role.end}
                  </p>
                )}
              </div>
              {role.summary && <p>{role.summary}</p>}
              {role.bullets && role.bullets.length > 0 && (
                <ul>
                  {role.bullets.map((bullet, bulletIdx) => (
                    <li key={`exp-${idx}-bullet-${bulletIdx}`}>{bullet}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </>
      )}

      {education.length > 0 && (
        <>
          <h2>{labels.education || "Education"}</h2>
          {education.map((edu, idx) => (
            <div className="section" key={`edu-${idx}`}>
              <div className="role-row">
                <div>
                  {edu.degree && <h3>{edu.degree}</h3>}
                  {(edu.school || edu.location) && (
                    <p className="subheading">
                      {edu.school}
                      {edu.school && edu.location ? ", " : ""}
                      {edu.location}
                    </p>
                  )}
                </div>
                {edu.graduated && (
                  <p className="subheading">
                    {(labels.graduated || "Graduated") + ": "}{edu.graduated}
                  </p>
                )}
              </div>
              {edu.details && <p>{edu.details}</p>}
            </div>
          ))}
        </>
      )}

      {skills.length > 0 && (
        <>
          <h2>{labels.skills || "Skills"}</h2>
          <ul className="list-simple">
            {skills.map((skill, idx) => (
              <li key={`skill-${idx}`}>{skill}</li>
            ))}
          </ul>
        </>
      )}

      {interests.length > 0 && (
        <>
          <h2>{labels.interests || "Interests"}</h2>
          <ul className="list-simple">
            {interests.map((interest, idx) => (
              <li key={`interest-${idx}`}>{interest}</li>
            ))}
          </ul>
        </>
      )}

      {certifications.length > 0 && (
        <>
          <h2>{labels.certifications || "Certifications"}</h2>
          <ul className="list-simple">
            {certifications.map((cert, idx) => (
              <li key={`cert-${idx}`}>{cert}</li>
            ))}
          </ul>
        </>
      )}

      {languages.length > 0 && (
        <>
          <h2>{labels.languages || "Languages"}</h2>
          <ul className="list-simple">
            {languages.map((lang, idx) => (
              <li key={`lang-${idx}`}>{lang}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default ResumeTemplatePreview;

