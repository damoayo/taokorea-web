"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  function doLogin() {
    setLoading(true);
    localStorage.setItem("isLoggedIn", "true");
    router.push("/admin/dashboard");
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    doLogin();
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
                type="text"
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
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-colors"
              />
            </div>

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
            <span className="text-xs text-gray-400">또는 소셜 계정으로 로그인</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* 소셜 로그인 버튼 */}
          <div className="space-y-2.5">
            {/* 카카오 */}
            <button
              type="button"
              onClick={doLogin}
              className="w-full rounded-lg bg-[#FEE500] text-[#3C1E1E] text-sm font-medium py-2.5 hover:bg-[#F0D900] active:bg-[#E0CA00] transition-colors flex items-center justify-center gap-2"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 1.5C4.86 1.5 1.5 4.19 1.5 7.5c0 2.1 1.26 3.95 3.18 5.04l-.81 3.02c-.07.26.22.47.45.32L7.77 13.8c.4.06.81.09 1.23.09 4.14 0 7.5-2.69 7.5-6 0-3.31-3.36-6-7.5-6z" fill="#3C1E1E"/>
              </svg>
              카카오톡으로 로그인
            </button>

            {/* 네이버 */}
            <button
              type="button"
              onClick={doLogin}
              className="w-full rounded-lg bg-[#03C75A] text-white text-sm font-medium py-2.5 hover:bg-[#02B350] active:bg-[#029F48] transition-colors flex items-center justify-center gap-2"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M10.2 9.27L7.68 5.4H5.4v7.2h2.4V8.73l2.52 3.87H12.6V5.4h-2.4v3.87z" fill="white"/>
              </svg>
              네이버로 로그인
            </button>

            {/* 구글 */}
            <button
              type="button"
              onClick={doLogin}
              className="w-full rounded-lg bg-white text-gray-700 text-sm font-medium py-2.5 border border-gray-200 hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-center justify-center gap-2"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                <path d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Google로 로그인
            </button>

            {/* 페이스북 */}
            <button
              type="button"
              onClick={doLogin}
              className="w-full rounded-lg bg-[#1877F2] text-white text-sm font-medium py-2.5 hover:bg-[#166FE5] active:bg-[#1468D8] transition-colors flex items-center justify-center gap-2"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M18 9a9 9 0 10-10.406 8.89v-6.288H5.31V9h2.284V7.017c0-2.253 1.343-3.499 3.4-3.499.984 0 2.015.175 2.015.175v2.212h-1.135c-1.119 0-1.467.695-1.467 1.408V9h2.496l-.399 2.602h-2.097v6.288A9.002 9.002 0 0018 9z" fill="white"/>
              </svg>
              Facebook으로 로그인
            </button>
          </div>

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
