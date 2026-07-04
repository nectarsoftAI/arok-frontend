import { useState } from "react";
import { Link } from "react-router";
import { AlertCircle, MailCheck, ArrowLeft } from "lucide-react";
import logoArok from "../../assets/logo_arok.webp";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { cn } from "../common/utils";

export function ResetPasswordScreen() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError("");
    if (!email) { setError("이메일을 입력해주세요."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("올바른 이메일 형식이 아닙니다."); return; }
    setLoading(true);
    // TODO: 백엔드 확인 필요 — 비밀번호 재설정 엔드포인트가 현재 Swagger에 없음
    setTimeout(() => { setLoading(false); setSent(true); }, 1200);
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
            {!sent ? (
              <>
                <div className="mb-7">
                  <h1 className="text-2xl font-bold text-[#1A1D2E]">비밀번호 재설정</h1>
                  <p className="text-sm text-[#6B7280] mt-1">
                    가입한 이메일 주소를 입력하면 재설정 링크를 보내드립니다.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1A1D2E] mb-1.5">이메일</label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(""); }}
                      placeholder="name@example.com"
                      autoFocus
                      variant="filled"
                      className={cn(
                        "rounded-xl placeholder-[#9CA3AF] text-[#1A1D2E]",
                        error && "border-red-300 bg-red-50",
                      )}
                    />
                    {error && (
                      <div className="flex items-center gap-1.5 mt-1.5 text-xs text-red-500">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        {error}
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="hero"
                    disabled={loading}
                    className="w-full py-3"
                  >
                    {loading ? "전송 중..." : "재설정 메일 보내기"}
                  </Button>
                </form>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#5B5FF5]/10 to-[#818CF8]/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <MailCheck className="w-8 h-8 text-[#5B5FF5]" />
                </div>
                <h2 className="text-xl font-bold text-[#1A1D2E] mb-2">메일을 확인해주세요</h2>
                <p className="text-sm text-[#6B7280] leading-relaxed">
                  <span className="font-medium text-[#1A1D2E]">{email}</span>으로<br />
                  비밀번호 재설정 링크를 보냈습니다.<br />
                  받은 편지함을 확인해주세요.
                </p>
                <p className="text-xs text-[#9CA3AF] mt-4">
                  메일이 오지 않으면 스팸함을 확인하거나{" "}
                  <button onClick={() => setSent(false)} className="text-[#5B5FF5] hover:underline">
                    다시 시도
                  </button>
                  해주세요.
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-center mt-5">
            <Link
              to="/login"
              className="flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#1A1D2E] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              로그인으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
