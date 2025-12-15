import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { acceptCollaborationInvitation } from "../services/CollaborationService";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import AuthLayout from "../Layouts/AuthLayout";

export default function AcceptCollaboration() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("");

  useEffect(() => {
    handleAccept();
  }, [token]);

  const handleAccept = async () => {
    try {
      const response = await acceptCollaborationInvitation(token);
      if (response.data.status) {
        setStatus("success");
        setMessage("Invitation accepted! Redirecting to resume...");
        toast.success("You can now edit this resume!");
        
        // Redirect to edit page after 2 seconds
        setTimeout(() => {
          navigate(`/resume/edit/${response.data.data.resume_id}`);
        }, 2000);
      }
    } catch (error) {
      setStatus("error");
      setMessage(
        error.response?.data?.message || 
        "Failed to accept invitation. The link may have expired or you may need to log in."
      );
      
      if (error.response?.status === 401) {
        // User needs to log in
        setTimeout(() => {
          navigate("/login", { state: { returnTo: `/collaborate/accept/${token}` } });
        }, 3000);
      }
    }
  };

  return (
    <AuthLayout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            {status === "loading" && (
              <>
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Accepting Invitation...
                </h2>
                <p className="text-gray-600">Please wait while we process your invitation.</p>
              </>
            )}

            {status === "success" && (
              <>
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Invitation Accepted!
                </h2>
                <p className="text-gray-600 mb-4">{message}</p>
              </>
            )}

            {status === "error" && (
              <>
                <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Unable to Accept Invitation
                </h2>
                <p className="text-gray-600 mb-4">{message}</p>
                <button
                  onClick={() => navigate("/login")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Go to Login
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}





