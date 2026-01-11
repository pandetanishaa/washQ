import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useApp } from "@/context/AppContext";
import PixelButton from "@/components/PixelButton";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useApp();
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<"user" | "admin">("user");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    // Mock authentication delay
    setTimeout(() => {
      try {
        login({
          email,
          role: selectedRole,
        });
        setIsLoading(false);
        navigate(selectedRole === "admin" ? "/admin" : "/machines");
      } catch (err) {
        setError("Login failed. Please try again.");
        setIsLoading(false);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-b from-primary/10 to-secondary/10">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-pixel text-primary text-pixel-shadow">
            wash<span className="text-secondary">Q</span>
          </h1>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="border-4 border-primary bg-white p-8 shadow-lg"
        >
          <h2 className="text-2xl font-pixel text-primary mb-6">LOGIN</h2>

          {error && (
            <Alert className="mb-6 border-2 border-red-500 bg-red-50">
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-sm font-pixel text-primary">EMAIL</label>
              <Input
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="border-2 border-primary focus:border-primary focus:ring-0"
              />
            </div>

            {/* Role Selection */}
            <div className="space-y-3">
              <label className="text-sm font-pixel text-primary">ROLE</label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedRole("user")}
                  disabled={isLoading}
                  className={`flex-1 py-3 border-2 font-pixel text-sm transition-colors ${
                    selectedRole === "user"
                      ? "border-primary bg-primary text-white"
                      : "border-primary text-primary bg-white hover:bg-primary/10"
                  } disabled:opacity-50`}
                >
                  USER
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole("admin")}
                  disabled={isLoading}
                  className={`flex-1 py-3 border-2 font-pixel text-sm transition-colors ${
                    selectedRole === "admin"
                      ? "border-primary bg-primary text-white"
                      : "border-primary text-primary bg-white hover:bg-primary/10"
                  } disabled:opacity-50`}
                >
                  ADMIN
                </button>
              </div>
            </div>

            {/* Login Button */}
            <PixelButton
              onClick={handleLogin}
              disabled={isLoading || !email}
              className="w-full"
            >
              {isLoading ? "LOGGING IN..." : "LOGIN"}
            </PixelButton>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t-2 border-gray-200">
            <p className="text-xs font-pixel text-gray-500 mb-2">DEMO EMAILS:</p>
            <div className="text-xs text-gray-600 space-y-1">
              <p>• User: user@example.com</p>
              <p>• Admin: admin@example.com</p>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-8 text-xs text-gray-500 font-pixel"
        >
          Mock authentication • localStorage-based
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
