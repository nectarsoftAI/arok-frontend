import { useState } from "react";
import { Link } from "react-router";
import { Mic, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { cn } from "../common/utils";

interface FieldErrors {
  email?: string;
  password?: string;
  confirm?: string;
}

const FieldError = ({ msg }: { msg?: string }) =>
  msg ? (
    <div className="flex items-center gap-1.5 mt-1.5 text-xs text-red-500">
      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
      {msg}
    </div>
  ) : null;

export function SignupScreen() {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  const validate = (): FieldErrors => {
    const e: FieldErrors = {};
    if (!email) e.email = "이메일을 입력해주세요.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "올바른 이메일 형식이 아닙니다.";
    if (password.length < 8) e.password = "비밀번호는 최소 8자 이상이어야 합니다.";
    if (confirm !== password) e.confirm = "비밀번호가 일치하지 않습니다.";
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);
    // TODO: Replace with actual signup API call (e.g. authApi.signup({ email, displayName, password }))
    setTimeout(() => setLoading(false), 1500);
  };

  const inputCls = (hasErr?: string) =>
    cn("rounded-xl placeholder-[#9CA3AF] text-[#1A1D2E]", hasErr && "border-red-300 bg-red-50");

  return (
    <div className="min-h-screen bg-[#F8F9FC] flex flex-col">
      <div className="px-8 py-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[#5B5FF5] to-[#818CF8] rounded-lg flex items-center justify-center">
            <Mic className="w-4 h-4 text-white" />
          </div>
          <span className="text-[#1A1D2E] font-semibold text-lg">Arok</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-[400px]">
          <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-8">
            <div className="mb-7">
              <h1 className="text-2xl font-bold text-[#1A1D2E]">회원가입</h1>
              <p className="text-sm text-[#6B7280] mt-1">Arok 계정을 만들어 시작하세요</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1A1D2E] mb-1.5">이메일</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
                  placeholder="name@example.com"
                  variant="filled"
                  className={inputCls(errors.email)}
                />
                <FieldError msg={errors.email} />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A1D2E] mb-1.5">
                  표시 이름 <span className="text-[#9CA3AF] font-normal">(선택)</span>
                </label>
                <Input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="예: 홍길동"
                  variant="filled"
                  className="rounded-xl placeholder-[#9CA3AF] text-[#1A1D2E]"
                />
                <p className="mt-1.5 text-xs text-[#9CA3AF]">비우면 이메일 앞부분이 자동으로 사용됩니다</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A1D2E] mb-1.5">비밀번호</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
                    placeholder="8자 이상 입력"
                    variant="filled"
                    className={cn(inputCls(errors.password), "pr-11")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <FieldError msg={errors.password} />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A1D2E] mb-1.5">비밀번호 확인</label>
                <div className="relative">
                  <Input
                    type={showConfirm ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => { setConfirm(e.target.value); setErrors((p) => ({ ...p, confirm: undefined })); }}
                    placeholder="비밀번호를 다시 입력"
                    variant="filled"
                    className={cn(inputCls(errors.confirm), "pr-11")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <FieldError msg={errors.confirm} />
              </div>

              <Button
                type="submit"
                variant="hero"
                disabled={loading}
                className="w-full py-3 mt-1"
              >
                {loading ? "가입 중..." : "회원가입"}
              </Button>
            </form>
          </div>

          <p className="text-center text-sm text-[#6B7280] mt-5">
            이미 계정이 있으신가요?{" "}
            <Link to="/login" className="text-[#5B5FF5] font-medium hover:underline">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
