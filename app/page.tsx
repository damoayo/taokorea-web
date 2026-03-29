"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      localStorage.setItem("isLoggedIn", "true");
      router.push("/admin/dashboard");
    }, 600);
  }

  function handleTaobaoLogin() {
    // 데모용: 바로 대시보드로 이동
    // 실제: https://oauth.taobao.global/authorize?response_type=code&client_id=앱키&redirect_uri=https://taokorea.com/api/auth/callback
    localStorage.setItem("isLoggedIn", "true");
    router.push("/admin/dashboard");
  }

  function handleSignup() {
    alert("회원가입 서비스는 준비 중입니다.");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* 로고 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">TaoKorea</span>
          </div>
          <p className="text-sm text-gray-500">타오바오 셀러 관리 플랫폼</p>
        </div>

        {/* 로그인 카드 */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">로그인</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                이메일
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="demo@taokorea.com"
                autoComplete="email"
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-colors"
              />
            </div>

            {error && (
              <p className="text-xs text-red-500">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gray-900 text-white text-sm font-medium py-2.5 hover:bg-gray-700 active:bg-gray-800 transition-colors disabled:opacity-60"
            >
              {loading ? "로그인 중..." : "로그인"}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">또는</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* 타오바오 로그인 버튼 */}
          <button
            type="button"
            onClick={handleTaobaoLogin}
            className="w-full rounded-lg bg-orange-500 text-white text-sm font-medium py-2.5 hover:bg-orange-600 active:bg-orange-700 transition-colors flex items-center justify-center gap-2"
          >
            <span className="text-base leading-none">🛒</span>
            타오바오 계정으로 로그인
          </button>

          <p className="text-center text-xs text-gray-400 mt-6">
            아직 계정이 없으신가요?{" "}
            <button
              type="button"
              onClick={handleSignup}
              className="text-orange-500 hover:text-orange-600 font-medium underline-offset-2 hover:underline transition-colors"
            >
              회원가입
            </button>
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © 2025 TaoKorea. All rights reserved.
        </p>
      </div>
    </div>
  );
}
