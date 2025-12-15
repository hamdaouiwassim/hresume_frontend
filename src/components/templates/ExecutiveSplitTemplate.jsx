const ExecutiveSplitTemplate = ({ resume = {}, labels = {} }) => {
  const contact = resume.contact || {};
  const experience = resume.experience || [];
  const education = resume.education || [];
  const skills = resume.skills || [];
  const interests = resume.interests || [];
  const certifications = resume.certifications || [];
  const languages = resume.languages || [];
  const hobbies = resume.hobbies || [];

  const formatTimelineLabel = (value) => {
    if (!value) return "";
    const normalized = value.toString().trim();
    if (!normalized) return "";
    if (/present/i.test(normalized)) return "Present";
    const date = new Date(normalized);
    if (Number.isNaN(date.getTime())) return normalized;
    return date.toLocaleDateString(undefined, {
      month: "short",
      year: "numeric",
    });
  };

  const formatTimeline = (start, end) => {
    const startLabel = formatTimelineLabel(start);
    const endLabel = formatTimelineLabel(end);
    if (!startLabel && !endLabel) return "";
    if (!endLabel) return startLabel;
    if (!startLabel) return endLabel;
    return `${startLabel} – ${endLabel}`;
  };

  const contactItems = [
    { label: "Email", value: contact.email },
    { label: "Phone", value: contact.phone },
    { label: "Location", value: contact.location },
    { label: "LinkedIn", value: contact.linkedin },
    { label: "Website", value: contact.website },
  ].filter((item) => item.value);

  return (
    <div className="exec-template" data-cv-preview="true">
      <style>
        {`
          .exec-template {
            font-family: 'Source Sans Pro', 'Segoe UI', Arial, sans-serif;
            background: #fff;
            padding: 32px;
            color: #0f172a;
            font-size: 13px;
            line-height: 1.45;
          }
          .exec-template * {
            box-sizing: border-box;
          }
          .exec-header {
            text-align: center;
            margin-bottom: 24px;
          }
          .exec-name {
            font-size: 32px;
            letter-spacing: 0.08em;
            margin: 0;
          }
          .exec-role {
            margin-top: 6px;
            font-size: 13px;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            color: #475569;
          }
          .exec-body {
            display: grid;
            grid-template-columns: 1fr 2fr;
            gap: 32px;
          }
          .exec-sidebar {
            border-right: 1px solid #e2e8f0;
            padding-right: 24px;
          }
          .exec-section {
            margin-bottom: 24px;
          }
          .exec-section h3 {
            font-size: 12px;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            margin: 0 0 10px;
            color: #1e293b;
          }
          .exec-contact-item {
            margin-bottom: 8px;
          }
          .exec-contact-label {
            font-weight: 600;
            font-size: 11px;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            display: block;
          }
          .exec-contact-value {
            font-size: 12px;
            color: #0f172a;
          }
          .exec-list {
            list-style: none;
            padding: 0;
            margin: 0;
          }
          .exec-list li {
            font-size: 12px;
            margin-bottom: 6px;
            color: #0f172a;
          }
          .exec-main .section-title {
            font-size: 12px;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            margin: 0 0 10px;
            color: #1e293b;
          }
          .exec-summary {
            font-size: 12.5px;
            line-height: 1.5;
            color: #1e293b;
            margin-bottom: 24px;
          }
          .exec-role {
            display: flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 4px;
          }
          .exec-role-title {
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.03em;
            text-align: left;
            width: 100%;
          }
          .exec-timeline {
            font-size: 11px;
            color: #64748b;
            margin: 0 0 6px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .exec-company {
            font-size: 12px;
            color: #475569;
            margin-bottom: 8px;
            text-align: left;
            width: 100%;
          }
          .exec-bullets {
            margin: 0 0 18px 20px;
            padding: 0;
          }
          .exec-bullets li {
            font-size: 12px;
            margin-bottom: 6px;
            color: #0f172a;
          }
          @media (max-width: 900px) {
            .exec-body {
              grid-template-columns: 1fr;
            }
            .exec-sidebar {
              border-right: none;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 24px;
              margin-bottom: 24px;
            }
            .exec-role {
              flex-direction: column;
              align-items: flex-start;
              gap: 4px;
            }
            .exec-role-meta {
              text-align: left;
            }
          }
        `}
      </style>

      <div className="exec-header">
        {resume.name && <h1 className="exec-name">{resume.name.toUpperCase()}</h1>}
        {resume.tagline && (
          <p className="exec-role">{resume.tagline.toUpperCase()}</p>
        )}
      </div>

      <div className="exec-body">
        <aside className="exec-sidebar">
          {contactItems.length > 0 && (
            <section className="exec-section">
              <h3>{labels.contact || "Contact"}</h3>
              {contactItems.map((item) => (
                <div className="exec-contact-item" key={item.label}>
                  <span className="exec-contact-label">{item.label}</span>
                  <span className="exec-contact-value">{item.value}</span>
                </div>
              ))}
            </section>
          )}

          {education.length > 0 && (
            <section className="exec-section">
              <h3>{labels.education || "Education"}</h3>
              <ul className="exec-list">
                {education.map((edu, idx) => (
                  <li key={`edu-${idx}`}>
                    <strong>{edu.degree}</strong>
                    {edu.school && ` | ${edu.school}`}
                    {edu.location && ` | ${edu.location}`}
                    {edu.graduated && ` (${labels.graduated || "Graduated"} ${edu.graduated})`}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {skills.length > 0 && (
            <section className="exec-section">
              <h3>{labels.skills || "Skills"}</h3>
              <ul className="exec-list">
                {skills.map((skill, idx) => (
                  <li key={`skill-${idx}`}>{skill}</li>
                ))}
              </ul>
            </section>
          )}

          {certifications.length > 0 && (
            <section className="exec-section">
              <h3>{labels.certifications || "Certifications"}</h3>
              <ul className="exec-list">
                {certifications.map((cert, idx) => (
                  <li key={`cert-${idx}`}>{cert}</li>
                ))}
              </ul>
            </section>
          )}

          {languages.length > 0 && (
            <section className="exec-section">
              <h3>{labels.languages || "Languages"}</h3>
              <ul className="exec-list">
                {languages.map((lang, idx) => (
                  <li key={`lang-${idx}`}>{lang}</li>
                ))}
              </ul>
            </section>
          )}

          {hobbies.length > 0 && (
            <section className="exec-section">
              <h3>{labels.hobbies || "Hobbies"}</h3>
              <ul className="exec-list">
                {hobbies.map((hobby, idx) => (
                  <li key={`hobby-${idx}`}>{hobby}</li>
                ))}
              </ul>
            </section>
          )}

          {interests.length > 0 && (
            <section className="exec-section">
              <h3>{labels.interests || "Interests"}</h3>
              <ul className="exec-list">
                {interests.map((interest, idx) => (
                  <li key={`int-${idx}`}>{interest}</li>
                ))}
              </ul>
            </section>
          )}
        </aside>

        <section className="exec-main">
          {resume.summary && (
            <div className="exec-section">
              <h3 className="section-title">
                {labels.professionalSummary || "Professional Summary"}
              </h3>
              <p className="exec-summary">{resume.summary}</p>
            </div>
          )}

          {experience.length > 0 && (
            <div className="exec-section">
              <h3 className="section-title">
                {labels.workExperience || "Professional Experience"}
              </h3>
              {experience.map((role, idx) => (
                <div key={`exp-${idx}`}>
                  <div className="exec-role">
                    <span className="exec-role-title">{role.title}</span>
                  </div>
                  {formatTimeline(role.start, role.end) && (
                    <p className="exec-timeline">
                      {formatTimeline(role.start, role.end)}
                    </p>
                  )}
                  {(role.company || role.location) && (
                    <p className="exec-company">
                      {[role.company, role.location].filter(Boolean).join(" | ")}
                    </p>
                  )}
                  {role.summary && <p className="exec-summary">{role.summary}</p>}
                  {role.bullets && role.bullets.length > 0 && (
                    <ul className="exec-bullets">
                      {role.bullets.map((bullet, bulletIdx) => (
                        <li key={`exp-${idx}-bullet-${bulletIdx}`}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ExecutiveSplitTemplate;


