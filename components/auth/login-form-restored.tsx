"use client";

import { login } from "@/lib/api";
import { ArrowRight, Globe, MessageCircleMore } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

const DEV_ADMIN_EMAIL = process.env.NEXT_PUBLIC_DEV_ADMIN_EMAIL;
const DEV_ADMIN_PASSWORD = process.env.NEXT_PUBLIC_DEV_ADMIN_PASSWORD;
const SHOW_DEV_ADMIN_HINT =
  process.env.NODE_ENV !== "production" &&
  Boolean(DEV_ADMIN_EMAIL || DEV_ADMIN_PASSWORD);

const KAKAO_AUTH_URL = process.env.NEXT_PUBLIC_AUTH_KAKAO_URL;
const GOOGLE_AUTH_URL = process.env.NEXT_PUBLIC_AUTH_GOOGLE_URL;

interface LoginFormRestoredProps {
  redirectTo: string;
}

function withRedirectParam(url: string, redirectTo: string) {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}redirect=${encodeURIComponent(redirectTo)}`;
}

export default function LoginFormRestored({
  redirectTo,
}: LoginFormRestoredProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const kakaoAuthUrl = KAKAO_AUTH_URL
    ? withRedirectParam(KAKAO_AUTH_URL, redirectTo)
    : null;
  const googleAuthUrl = GOOGLE_AUTH_URL
    ? withRedirectParam(GOOGLE_AUTH_URL, redirectTo)
    : null;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    startTransition(async () => {
      try {
        const user = await login(email, password);

        if (user.role !== "ADMIN") {
          setError("This account does not have admin access.");
          return;
        }

        router.replace(redirectTo);
      } catch (submitError) {
        setError(
          submitError instanceof Error
            ? submitError.message
            : "Login failed. Please try again."
        );
      }
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="TaoKorea"
              width={180}
              height={60}
              className="object-contain"
            />
          </div>
          <p className="text-sm text-slate-500">SellerHub admin access</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-slate-900">Sign in</h1>
            <p className="mt-2 text-sm text-slate-500">
              Use your administrator account to continue.
            </p>
          </div>

          {SHOW_DEV_ADMIN_HINT ? (
            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <p className="font-medium">Development admin account</p>
              {DEV_ADMIN_EMAIL ? <p>Email: {DEV_ADMIN_EMAIL}</p> : null}
              {DEV_ADMIN_PASSWORD ? <p>Password: {DEV_ADMIN_PASSWORD}</p> : null}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@taokorea.com"
                className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                required
              />
            </div>

            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-xl bg-slate-900 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-200 pt-6">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white">
                  <MessageCircleMore size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    SNS 가입 / 로그인
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    카카오 또는 구글 계정으로 바로 가입하거나 로그인할 수 있습니다.
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                {kakaoAuthUrl ? (
                  <a
                    href={kakaoAuthUrl}
                    className="flex items-center justify-between rounded-2xl border border-yellow-300 bg-[#FEE500] px-4 py-3 text-sm font-medium text-slate-900 transition hover:brightness-95"
                  >
                    <span className="flex items-center gap-2">
                      <MessageCircleMore size={16} />
                      카카오로 시작하기
                    </span>
                    <ArrowRight size={16} />
                  </a>
                ) : (
                  <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-400">
                    <span className="flex items-center gap-2">
                      <MessageCircleMore size={16} />
                      카카오 가입 준비 중
                    </span>
                    <span className="text-xs font-medium">URL 필요</span>
                  </div>
                )}

                {googleAuthUrl ? (
                  <a
                    href={googleAuthUrl}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
                  >
                    <span className="flex items-center gap-2">
                      <Globe size={16} />
                      Google로 시작하기
                    </span>
                    <ArrowRight size={16} />
                  </a>
                ) : (
                  <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-400">
                    <span className="flex items-center gap-2">
                      <Globe size={16} />
                      Google 가입 준비 중
                    </span>
                    <span className="text-xs font-medium">URL 필요</span>
                  </div>
                )}
              </div>

              <p className="mt-4 text-xs leading-5 text-slate-500">
                SNS 인증이 끝나면 요청한 페이지로 돌아가도록 현재 경로를 함께 전달합니다.
              </p>
            </div>

            <Link
              href={redirectTo === "/products" ? "/products" : "/home"}
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
              둘러보기로 이동
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
