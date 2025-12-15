import { useLanguage } from "../context/LanguageContext";
import ClassicTemplate from "./templates/ClassicTemplate";
import ExecutiveSplitTemplate from "./templates/ExecutiveSplitTemplate";
import { TEMPLATE_LAYOUTS } from "../utils/templateStyles";

const TEMPLATE_COMPONENTS = {
  [TEMPLATE_LAYOUTS.EXECUTIVE_SPLIT]: ExecutiveSplitTemplate,
  [TEMPLATE_LAYOUTS.CLASSIC]: ClassicTemplate,
};

const ResumeTemplatePreview = ({
  resume = {},
  templateKey = TEMPLATE_LAYOUTS.CLASSIC,
}) => {
  const { t } = useLanguage();
  const labels = t?.preview || {};
  const TemplateComponent =
    TEMPLATE_COMPONENTS[templateKey] || TEMPLATE_COMPONENTS[TEMPLATE_LAYOUTS.CLASSIC];

  return <TemplateComponent resume={resume} labels={labels} />;
};

export default ResumeTemplatePreview;

