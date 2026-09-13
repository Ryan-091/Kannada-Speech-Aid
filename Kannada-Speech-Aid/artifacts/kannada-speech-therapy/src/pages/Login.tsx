import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { HeartPulse, Eye, EyeOff, Mail, Lock, User, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { useAuth, type UserRole } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCreatePatient } from "@workspace/api-client-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

type Mode = "signin" | "signup" | "forgot";

export default function Login() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const { login } = useAuth();
  const { t, lang, setLang } = useLanguage();

  const [mode, setMode] = useState<Mode>("signin");
  const [role, setRole] = useState<UserRole>(
    () => new URLSearchParams(window.location.search).get("role") === "therapist" 
      ? "therapist" 
      : "patient"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [condition, setCondition] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const { mutateAsync: createPatient } = useCreatePatient();

  const handleSignIn = async () => {
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setIsLoading(true); setError("");
    try {
      if (role === "therapist") {
        const response = await fetch(`${API_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, role: "therapist" }),
        });
        const data = await response.json();
        if (!response.ok) {
          setError(data.error || "Login failed. Please try again.");
          return;
        }
        if (data.role !== "therapist") {
          setError("This account is not a therapist account.");
          return;
        }
        login({ id: data.id, name: data.name, role: "therapist", email: data.email });
        navigate("/therapist");
      } else {
        const response = await fetch(`${API_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, role: "patient" }),
        });
        const data = await response.json();
        if (!response.ok) {
          setError(data.error || "Login failed. Please try again.");
          return;
        }
        if (data.role !== "patient") {
          setError("This account is not a patient account.");
          return;
        }
        login({ id: data.id, name: data.name, role: "patient", email: data.email });
        navigate(`/patient/${data.id}`);
      }
    } catch {
      setError("Cannot connect to server. Please make sure the server is running.");
    } finally { setIsLoading(false); }
  };

  const handleSignUp = async () => {
    if (!email || !password || !name) { setError("Please fill in all required fields."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setIsLoading(true); setError("");
    try {
      await new Promise(r => setTimeout(r, 800));
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          age: parseInt(age) || 0,
          condition: condition || (role === "therapist" ? "N/A" : "New patient"),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Sign up failed.");
        return;
      }
      setSuccessMsg(t("login.signup.success"));
      setTimeout(() => {
        if (role === "therapist") {
          login({ id: data.id, name: data.name, role: "therapist", email: data.email });
          navigate("/therapist");
        } else {
          login({ id: data.id, name: data.name, role: "patient", email: data.email });
          navigate(`/patient/${data.id}`);
        }
      }, 1200);
    } catch {
      setError("Sign up failed. Please try again.");
    } finally { setIsLoading(false); }
  };

  const handleForgotPassword = async () => {
    if (!email) { setError("Please enter your email address."); return; }
    setIsLoading(true); setError("");
    await new Promise(r => setTimeout(r, 800));
    setIsLoading(false);
    setSuccessMsg(t("login.reset.sent"));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "signin") handleSignIn();
    else if (mode === "signup") handleSignUp();
    else handleForgotPassword();
  };

  return (
    <div className="min-h-screen bg-gradient-warm flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/10 blur-[100px] pointer-events-none" />

      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={() => setLang(lang === "en" ? "kn" : "en")}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-border shadow-sm text-sm font-medium hover:bg-white transition-colors"
        >
          <span className="text-base">{lang === "en" ? "🇮🇳" : "🇬🇧"}</span>
          <span>{lang === "en" ? "ಕನ್ನಡ" : "English"}</span>
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-3xl bg-white shadow-xl flex items-center justify-center mb-4 border border-border">
            <HeartPulse className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">{t("login.title")}</h1>
          <p className="text-muted-foreground text-center mt-1 text-sm">{t("login.subtitle")}</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl shadow-primary/5 border border-border/50 p-8">
          {mode !== "forgot" && (
            <div className="flex bg-muted rounded-2xl p-1 mb-6">
              <button
                onClick={() => { setMode("signin"); setError(""); setSuccessMsg(""); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${mode === "signin" ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >{t("login.signin")}</button>
              <button
                onClick={() => { setMode("signup"); setError(""); setSuccessMsg(""); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${mode === "signup" ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >{t("login.signup")}</button>
            </div>
          )}

          {mode !== "forgot" && (
            <div className="mb-5">
              <label className="block text-sm font-medium text-foreground mb-2">{t("login.role")}</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("patient")}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-sm font-semibold ${
                    role === "patient"
                      ? "border-primary bg-primary text-white shadow-md"
                      : "border-border text-muted-foreground hover:border-primary/40 bg-white"
                  }`}
                >
                  <User className="w-4 h-4" /> {t("login.patient")}
                </button>
                <button
                  type="button"
                  onClick={() => setRole("therapist")}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-sm font-semibold ${
                    role === "therapist"
                      ? "border-primary bg-primary text-white shadow-md"
                      : "border-border text-muted-foreground hover:border-primary/40 bg-white"
                  }`}
                >
                  <User className="w-4 h-4" /> {t("login.therapist")}
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {successMsg ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center py-6 text-center"
                >
                  <CheckCircle2 className="w-12 h-12 text-green-500 mb-3" />
                  <p className="text-foreground font-semibold">{successMsg}</p>
                </motion.div>
              ) : (
                <motion.div key={mode} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                  {mode === "forgot" && (
                    <div className="mb-2">
                      <h2 className="text-xl font-bold text-foreground">{t("login.forgot")}</h2>
                      <p className="text-sm text-muted-foreground mt-1">Enter your email and we'll send a reset link.</p>
                    </div>
                  )}

                  {mode === "signup" && (
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">{t("login.name")} *</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ramaswamy" className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-muted/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" required />
                      </div>
                    </div>
                  )}

                  {mode === "signup" && role === "patient" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">{t("login.age")}</label>
                        <input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="65" min="1" max="120" className="w-full px-4 py-3 rounded-xl border border-border bg-muted/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">{t("login.condition")}</label>
                        <input type="text" value={condition} onChange={e => setCondition(e.target.value)} placeholder="Aphasia" className="w-full px-4 py-3 rounded-xl border border-border bg-muted/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">{t("login.email")} *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-muted/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" required />
                    </div>
                  </div>

                  {mode !== "forgot" && (
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">{t("login.password")} *</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-10 pr-10 py-3 rounded-xl border border-border bg-muted/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {mode === "signup" && (
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">{t("login.confirmpassword")} *</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-muted/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" required />
                      </div>
                    </div>
                  )}

                  {mode === "signin" && (
                    <div className="text-right -mt-1">
                      <button type="button" onClick={() => { setMode("forgot"); setError(""); }} className="text-sm text-primary hover:underline font-medium">
                        {t("login.forgotlink")}
                      </button>
                    </div>
                  )}

                  {error && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-destructive bg-destructive/10 px-4 py-2.5 rounded-xl">
                      {error}
                    </motion.p>
                  )}

                  <button type="submit" disabled={isLoading} className="w-full py-3.5 rounded-xl bg-primary text-white font-bold text-base flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-70">
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                      <>
                        {mode === "signin" ? t("login.submit.signin") : mode === "signup" ? t("login.submit.signup") : t("login.submit.reset")}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="text-center text-sm text-muted-foreground pt-1">
                    {mode === "forgot" ? (
                      <button type="button" onClick={() => { setMode("signin"); setError(""); setSuccessMsg(""); }} className="text-primary hover:underline font-medium">
                        ← {t("login.backto")}
                      </button>
                    ) : mode === "signin" ? (
                      <span>{t("login.noaccount")} <button type="button" onClick={() => { setMode("signup"); setError(""); }} className="text-primary hover:underline font-medium">{t("login.signup")}</button></span>
                    ) : (
                      <span>{t("login.hasaccount")} <button type="button" onClick={() => { setMode("signin"); setError(""); }} className="text-primary hover:underline font-medium">{t("login.signin")}</button></span>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>
      </motion.div>
    </div>
  );
}