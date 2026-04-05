"use client";

import { login } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowRight, CheckCircle2, Globe, MessageCircleMore, UserPlus } from "lucide-react";

const DEV_ADMIN_EMAIL = process.env.NEXT_PUBLIC_DEV_ADMIN_EMAIL;
const DEV_ADMIN_PASSWORD = process.env.NEXT_PUBLIC_DEV_ADMIN_PASSWORD;
const SHOW_DEV_ADMIN_HINT =
  process.env.NODE_ENV !== "production" &&
  Boolean(DEV_ADMIN_EMAIL || DEV_ADMIN_PASSWORD);

interface LoginFormProps {
  redirectTo: string;
}

export default function LoginForm({ redirectTo }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fff7ed,transparent_35%),linear-gradient(180deg,#f8fafc_0%,#ffffff_45%,#f8fafc_100%)] px-4 py-10">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(380px,440px)]">
        <section className="hidden rounded-[2rem] border border-white/70 bg-white/70 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur lg:block">
          <div className="mb-10">
            <div className="mb-4 inline-flex items-center justify-center rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
              TAOKOREA SELLERHUB
            </div>
            <h1 className="max-w-xl text-4xl font-semibold leading-tight text-slate-900">
              관리자 로그인과 신규 가입 안내를 한 화면에서 확인하세요.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
              운영 계정 로그인, 신규가입 절차, SNS 가입 오픈 예정 항목을 모두
              여기서 확인할 수 있도록 복구했습니다.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
                <UserPlus size={20} />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">신규가입</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                신규 셀러 계정은 운영 확인 후 개설됩니다. 로그인 전에도 절차를
                확인할 수 있게 다시 노출했습니다.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-slate-500">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="mt-0.5 text-emerald-500" />
                  <span>기본 정보 접수 후 운영 승인</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="mt-0.5 text-emerald-500" />
                  <span>승인 완료 시 관리자 계정 발급</span>
                </li>
              </ul>
              <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                <ArrowRight size={14} />
                신규가입 접수 기능은 준비중
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-900 p-5 text-white shadow-sm">
              <div className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-white/10">
                <MessageCircleMore size={20} />
              </div>
              <h2 className="text-lg font-semibold">SNS 가입</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                카카오, 네이버, 구글 계정 연동 영역이 보이지 않던 문제를
                반영해 안내 영역을 다시 추가했습니다.
              </p>
              <div className="mt-5 grid gap-2">
                <button
                  type="button"
                  disabled
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80"
                >
                  <span className="flex items-center gap-2">
                    <MessageCircleMore size={16} />
                    카카오로 가입
                  </span>
                  <span className="text-xs text-white/50">준비중</span>
                </button>
                <button
                  type="button"
                  disabled
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80"
                >
                  <span className="flex items-center gap-2">
                    <Globe size={16} />
                    구글로 가입
                  </span>
                  <span className="text-xs text-white/50">준비중</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="w-full">
          <div className="mb-8 text-center lg:text-left">
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
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">신규가입</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    운영 승인형 가입 절차를 다시 안내합니다.
                  </p>
                  <p className="mt-3 text-xs font-medium text-orange-600">
                    현재는 안내만 제공됩니다.
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">SNS 가입</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    카카오/구글 연동 영역을 로그인 페이지에 다시 표시했습니다.
                  </p>
                  <div className="mt-3 flex gap-2 text-xs text-slate-500">
                    <span className="rounded-full bg-white px-2.5 py-1">카카오 준비중</span>
                    <span className="rounded-full bg-white px-2.5 py-1">구글 준비중</span>
                  </div>
                </div>
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
    </div>
  );
}
