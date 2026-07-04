import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import logoArok from "../../assets/logo_arok.webp";
import { isAxiosError } from "axios";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { login, extractErrorMessage } from "../../api/auth";
import { useAuthStore } from "../../store/authStore";

export function LoginScreen() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // hydration 완료 전엔 렌더 보류 (persist 복원 전 /login 으로 튕기는 현상 방지)
  if (!hasHydrated) return null;
  if (isAuthenticated) return <Navigate to="/" replace />;

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }
    setLoading(true);
    try {
      const response = await login(email, password);
      setAuth(response);
      navigate("/");
    } catch (err) {
      setLoading(false);
      if (isAxiosError(err) && (err.response?.status === 401 || err.response?.status === 400)) {
        setError("이메일 또는 비밀번호가 일치하지 않습니다.");
      } else {
        setError(extractErrorMessage(err));
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] flex flex-col">
      <div className="px-8 py-6">
        <div className="flex items-center gap-2">
          <img src={logoArok} alt="Arok" className="h-10 w-auto" />
          <span className="text-[#1A1D2E] font-extrabold text-2xl">Arok</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-[400px]">
          <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-8">
            <div className="mb-7">
              <h1 className="text-2xl font-bold text-[#1A1D2E]">로그인</h1>
              <p className="text-sm text-[#6B7280] mt-1">Arok 계정으로 로그인하세요</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1A1D2E] mb-1.5">이메일</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  placeholder="name@example.com"
                  variant="filled"
                  className="rounded-xl placeholder-[#9CA3AF] text-[#1A1D2E]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A1D2E] mb-1.5">비밀번호</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    placeholder="비밀번호 입력"
                    variant="filled"
                    className="rounded-xl placeholder-[#9CA3AF] text-[#1A1D2E] pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="mt-1.5 flex justify-end">
                  <Link to="/reset-password" className="text-xs text-[#5B5FF5] hover:underline">
                    비밀번호를 잊으셨나요?
                  </Link>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 px-3.5 py-2.5 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                variant="hero"
                disabled={loading}
                className="w-full py-3 mt-1"
              >
                {loading ? "로그인 중..." : "로그인"}
              </Button>
            </form>
          </div>

          <p className="text-center text-sm text-[#6B7280] mt-5">
            계정이 없으신가요?{" "}
            <Link to="/signup" className="text-[#5B5FF5] font-medium hover:underline">
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
