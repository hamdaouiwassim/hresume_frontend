import { useContext, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import AuthLayout from "../Layouts/AuthLayout";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AuthContext } from "../context/AuthContext";
import { peekGuestResumeDraft, consumeGuestResumeDraft } from "../utils/guestResumeDraft";
import { saveNewResume } from "../services/resumeService";

/**
 * After login/register, creates the server resume from the guest draft in localStorage.
 */
export default function ClaimGuestResume() {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [status, setStatus] = useState("working");

  useEffect(() => {
    if (loading) return;
    if (!user) return;

    const run = async () => {
      const draft = peekGuestResumeDraft();
      if (!draft) {
        navigate("/resumes", { replace: true });
        return;
      }

      try {
        const response = await saveNewResume({
          name: draft.name,
          template_id: draft.template_id,
        });
        const id = response?.data?.data?.id;
        if (!id) {
          throw new Error("Missing resume id");
        }
        consumeGuestResumeDraft();
        toast.success("Your resume was created from your draft.");
        navigate(`/resume/edit/${id}`, { replace: true });
      } catch (e) {
        setStatus("error");
        const code = e.response?.data?.code;
        toast.error(
          e.response?.data?.message ||
            "Could not create your resume. Please try again from Create resume."
        );
        navigate(code === "resume_limit_reached" ? "/resumes" : "/resume/create", {
          replace: true,
        });
      }
    };

    void run();
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <AuthLayout>
        <div className="min-h-[40vh] flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        </div>
      </AuthLayout>
    );
  }

  if (!user) {
    return <Navigate to="/login?next=/resume/claim-draft" replace />;
  }

  if (status === "error") {
    return null;
  }

  return (
    <AuthLayout>
      <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3 px-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-sm text-slate-600 text-center">Setting up your resume…</p>
      </div>
    </AuthLayout>
  );
}
