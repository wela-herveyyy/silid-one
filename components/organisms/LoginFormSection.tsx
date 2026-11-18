"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Building2, Check, ChevronDown, Eye, EyeOff, Lock, Mail, Search, User, X } from "lucide-react";
import Link from "next/link";
import { BrandLogo } from "@/components/atoms/BrandLogo";
import { useLoginForm } from "@/components/organisms/loginFormSection.hooks";

export function LoginFormSection() {
  const {
    mode,
    setMode,
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    rememberMe,
    setRememberMe,
    serverError,
    callbackURL,
    formAction,
    schoolQuery,
    setSchoolQuery,
    schoolResults,
    schoolsLoading,
    schoolDropdownOpen,
    setSchoolDropdownOpen,
    selectedSchool,
    selectSchool,
    clearSchool,
  } = useLoginForm();
  const brandOrange = "#F97316";

  return (
    <div className="login-page relative flex min-h-screen w-full flex-col overflow-hidden bg-white text-gray-900">
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
        <svg
          className="block h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1920 1080"
          preserveAspectRatio="xMidYMid slice"
        >
          <g fill="none">
            <rect width="1920" height="1080" x="0" y="0" fill="rgba(255, 255, 255, 1)" />
            <path
              d="M1616.2 928.72L1607.46 919.36 1614.67 908.78 1605.93 899.42 1613.15 888.84 1604.41 879.48 1611.62 868.9M1624.17 928.11L1615.43 918.75 1622.65 908.17 1613.91 898.81 1621.12 888.23 1612.39 878.87 1619.6 868.29M1632.15 927.5L1623.41 918.14 1630.63 907.56 1621.89 898.2 1629.1 887.62 1620.36 878.26 1627.58 867.68"
              stroke="rgba(249, 115, 22, 0.49)"
              strokeWidth="2.09"
              strokeDasharray="2, 2"
            />
            <rect
              width="591.92"
              height="591.92"
              clipPath="url(#silid-login-c1)"
              x="-102.65"
              y="172.61"
              fill="url(#silid-login-p1)"
              transform="rotate(96.72, 193.31, 468.57)"
            />
            <circle r="161" cx="536.28" cy="914.73" fill="rgba(249, 115, 22, 0.49)" />
            <rect
              width="60"
              height="60"
              clipPath="url(#silid-login-c2)"
              x="571.76"
              y="635.99"
              fill="url(#silid-login-p2)"
              transform="rotate(293.63, 601.76, 665.99)"
            />
            <rect
              width="432"
              height="432"
              clipPath="url(#silid-login-c3)"
              x="195.21"
              y="-188.49"
              fill="url(#silid-login-p3)"
              transform="rotate(324.11, 411.21, 27.51)"
            />
            <circle r="90" cx="725.96" cy="986.71" fill="rgba(253, 186, 116, 0.55)" />
            <path
              d="M1134.94 183.14L1129.82 171.4 1140.15 163.84 1135.04 152.09 1145.37 144.53 1140.26 132.79 1150.59 125.22"
              stroke="rgba(194, 65, 12, 1)"
              strokeWidth="2"
              strokeDasharray="3, 2"
            />
            <rect
              width="684"
              height="684"
              clipPath="url(#silid-login-c4)"
              x="-257.51"
              y="656.01"
              fill="url(#silid-login-p4)"
              transform="rotate(310.02, 84.49, 998.01)"
            />
            <path
              d="M1605 68 L1675 125 L1645 185 L1765 155 L1725 225 L1835 165"
              fill="none"
              stroke="rgba(249, 115, 22, 0.22)"
              strokeWidth="1.2"
              strokeDasharray="7, 6"
            />
            <circle
              r="18"
              cx="1805"
              cy="108"
              fill="none"
              stroke="rgba(253, 186, 116, 0.35)"
              strokeWidth="1.2"
              strokeDasharray="5, 4"
            />
            <path d="M1740 210 L1845 188 L1795 285 Z" fill="rgba(253, 186, 116, 0.18)" />
            <circle r="7" cx="1875" cy="52" fill="rgba(249, 115, 22, 0.2)" />
            <path
              d="M1625 985 L1695 915 L1765 975 L1720 1045 L1820 1005"
              fill="none"
              stroke="rgba(194, 65, 12, 0.32)"
              strokeWidth="1.25"
              strokeDasharray="6, 5"
            />
            <circle r="32" cx="1825" cy="955" fill="rgba(253, 186, 116, 0.2)" />
            <path d="M1765 875 L1885 905 L1825 1005 Z" fill="rgba(249, 115, 22, 0.16)" />
          </g>
          <defs>
            <pattern
              id="silid-login-p1"
              x="0"
              y="0"
              width="6.04"
              height="6.04"
              patternUnits="userSpaceOnUse"
            >
              <path d="M0 6.04L3.02 0L6.04 6.04" stroke="rgba(194, 65, 12, 1)" fill="none" />
            </pattern>
            <clipPath id="silid-login-c1">
              <circle r="147.98" cx="193.31" cy="468.57" />
            </clipPath>
            <pattern
              id="silid-login-p2"
              x="0"
              y="0"
              width="6"
              height="6"
              patternUnits="userSpaceOnUse"
            >
              <path d="M3 1L3 5M1 3L5 3" stroke="rgba(194, 65, 12, 1)" fill="none" strokeWidth="1.47" />
            </pattern>
            <clipPath id="silid-login-c2">
              <circle r="15" cx="601.76" cy="665.99" />
            </clipPath>
            <pattern
              id="silid-login-p3"
              x="0"
              y="0"
              width="6"
              height="6"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M3 1L3 5M1 3L5 3"
                stroke="rgba(253, 186, 116, 0.55)"
                fill="none"
                strokeWidth="1"
              />
            </pattern>
            <clipPath id="silid-login-c3">
              <circle r="108" cx="411.21" cy="27.51" />
            </clipPath>
            <pattern
              id="silid-login-p4"
              x="0"
              y="0"
              width="6"
              height="6"
              patternUnits="userSpaceOnUse"
            >
              <path d="M0 6L3 0L6 6" stroke="rgba(253, 186, 116, 0.55)" fill="none" />
            </pattern>
            <clipPath id="silid-login-c4">
              <circle r="171" cx="84.49" cy="998.01" />
            </clipPath>
          </defs>
        </svg>
      </div>

      <div className="relative z-10 mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col items-center justify-center lg:flex-row lg:items-center lg:justify-center">
        <div
          className="pointer-events-none hidden w-full shrink-0 flex-col items-center justify-center px-6 lg:flex lg:min-h-0 lg:flex-1 lg:px-8 lg:py-8 xl:py-10"
          aria-hidden="true"
        >
          <div className="relative mx-auto h-[min(70vh,520px)] w-full max-w-md lg:-translate-y-6 xl:h-[min(78vh,640px)] xl:max-w-lg xl:-translate-y-8">
            <DotLottieReact
              src="/lottie/login_background.lottie"
              autoplay
              loop
              className="h-full w-full"
            />
          </div>
        </div>

        <div className="flex w-full flex-1 flex-col items-center justify-center px-4 py-8 sm:px-8 sm:py-10 lg:flex-1 lg:px-8">
          <div className="mx-auto w-full max-w-sm text-start sm:max-w-md">
            <BrandLogo href="" size="display" />
            <p className="mt-5 text-start text-sm font-normal text-gray-600 sm:mt-6 sm:text-base">
              {mode === "signup" ? "Create a Silid account" : "Login to your account"}
            </p>

            {serverError ? (
              <p
                role="alert"
                className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700"
              >
                {serverError}
              </p>
            ) : null}

            <form action={formAction} className="mt-3 space-y-6 sm:mt-4 sm:space-y-8">
              <input type="hidden" name="callbackURL" value={callbackURL} />
              <input type="hidden" name="schoolSite" value={selectedSchool?.site ?? ""} />
              <input type="hidden" name="schoolCode" value={selectedSchool?.schoolCode ?? ""} />
              <input type="hidden" name="schoolName" value={selectedSchool?.name ?? ""} />
              <input type="hidden" name="schoolVersion" value={selectedSchool?.version ?? "v2"} />

              {mode === "signin" ? (
                <div className="relative">
                  <label htmlFor="school-search" className="sr-only">
                    Search school
                  </label>
                  <div className="relative flex w-full items-center gap-3 border-b border-gray-400 pb-2 transition-colors focus-within:border-gray-600">
                    <Search className="h-5 w-5 shrink-0" style={{ color: brandOrange }} />
                    <input
                      id="school-search"
                      type="text"
                      value={schoolQuery}
                      onFocus={() => setSchoolDropdownOpen(true)}
                      onChange={(e) => {
                        setSchoolQuery(e.target.value);
                        setSchoolDropdownOpen(true);
                      }}
                      placeholder="Search school (name, code, or https:// URL)"
                      autoComplete="organization"
                      className="w-full min-w-0 border-0 bg-transparent py-1 text-base text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-0"
                    />
                    {selectedSchool || schoolQuery ? (
                      <button
                        type="button"
                        onClick={clearSchool}
                        aria-label="Clear school selection"
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSchoolDropdownOpen((v) => !v)}
                        aria-label="Toggle school list"
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {selectedSchool ? (
                    <div className="mt-2 flex items-center justify-between gap-2 rounded-lg border border-orange-200 bg-orange-50/80 px-3 py-1.5 text-xs text-gray-800">
                      <span className="flex min-w-0 items-center gap-1.5 truncate">
                        <Building2 className="h-3.5 w-3.5 shrink-0 text-orange-600" />
                        <span className="truncate font-medium">{selectedSchool.name}</span>
                        <span className="rounded bg-white px-1.5 py-0.5 font-mono text-[10px] font-semibold text-orange-700 ring-1 ring-orange-200">
                          {selectedSchool.schoolCode}
                        </span>
                      </span>
                      <span className="shrink-0 truncate text-[11px] text-gray-500">
                        {selectedSchool.site}
                      </span>
                    </div>
                  ) : null}

                  {schoolDropdownOpen ? (
                    <div
                      role="listbox"
                      aria-label="Matching schools"
                      className="absolute left-0 right-0 top-full z-30 mt-1 max-h-60 overflow-y-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
                    >
                      {schoolsLoading ? (
                        <div className="px-3.5 py-2.5 text-xs text-gray-500">Searching schools…</div>
                      ) : schoolResults.length === 0 ? (
                        <div className="px-3.5 py-2.5 text-xs text-gray-500">
                          No matching school. Paste an https:// school URL to connect.
                        </div>
                      ) : (
                        schoolResults.map((school) => {
                          const isSelected = selectedSchool?.id === school.id;
                          return (
                            <button
                              key={school.id}
                              type="button"
                              role="option"
                              aria-selected={isSelected}
                              onClick={() => selectSchool(school)}
                              className="flex w-full items-center justify-between gap-2 px-3.5 py-2 text-left text-xs transition-colors hover:bg-orange-50"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="truncate font-medium text-gray-900">
                                    {school.name}
                                  </span>
                                  <span className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[10px] text-gray-700">
                                    {school.schoolCode}
                                  </span>
                                  <span className="shrink-0 rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-orange-700">
                                    {school.version}
                                  </span>
                                </div>
                                <div className="truncate text-[11px] text-gray-500">{school.site}</div>
                              </div>
                              {isSelected ? (
                                <Check className="h-4 w-4 shrink-0 text-orange-600" />
                              ) : null}
                            </button>
                          );
                        })
                      )}
                    </div>
                  ) : null}
                </div>
              ) : null}

              {mode === "signup" ? (
                <div>
                  <label htmlFor="name" className="sr-only">
                    Full name
                  </label>
                  <div className="relative flex w-full items-center gap-3 border-b border-gray-400 pb-2 transition-colors focus-within:border-gray-600">
                    <User className="h-5 w-5 shrink-0" style={{ color: brandOrange }} />
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full name"
                      className="w-full min-w-0 border-0 bg-transparent py-1 text-base text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-0"
                    />
                  </div>
                </div>
              ) : null}

              <div>
                <label htmlFor="email" className="sr-only">
                  Email or ID
                </label>
                <div className="relative flex w-full items-center gap-3 border-b border-gray-400 pb-2 transition-colors focus-within:border-gray-600">
                  <Mail className="h-5 w-5 shrink-0" style={{ color: brandOrange }} />
                  <input
                    id="email"
                    name="email"
                    type="text"
                    required
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={selectedSchool ? "Email or Frappe username" : "Email address"}
                    className="w-full min-w-0 border-0 bg-transparent py-1 text-base text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-0"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <div className="relative flex w-full items-center gap-3 border-b border-gray-400 pb-2 transition-colors focus-within:border-gray-600">
                  <Lock className="h-5 w-5 shrink-0" style={{ color: brandOrange }} />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full min-w-0 border-0 bg-transparent py-1 pr-10 text-base text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-0"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label="Toggle password visibility"
                    className="absolute bottom-1 right-0 p-1 text-gray-400 transition-colors hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                <label className="inline-flex cursor-pointer select-none items-center gap-2 text-gray-700">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 shrink-0 rounded border-2 bg-white"
                    style={{ borderColor: brandOrange, accentColor: brandOrange }}
                  />
                  <span>Remember me</span>
                </label>
                <Link
                  href="/class"
                  className="font-medium transition-opacity hover:opacity-80"
                  style={{ color: brandOrange }}
                >
                  Open class workspace →
                </Link>
              </div>

              <button
                type="submit"
                className="w-full rounded-full py-3 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] focus-visible:ring-offset-2 sm:py-3.5 sm:text-base"
                style={{ backgroundColor: brandOrange }}
              >
                {mode === "signup" ? "Create Account" : "Login"}
              </button>
            </form>

            <div className="mt-8 border-t border-gray-200 pt-6 sm:mt-12 sm:pt-8">
              <p className="text-start text-xs text-gray-600 sm:text-sm">
                {mode === "signup" ? "Already have an account? " : "Need an account? "}
                <button
                  type="button"
                  onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
                  className="font-medium transition-opacity hover:opacity-80"
                  style={{ color: brandOrange }}
                >
                  {mode === "signup" ? "Sign in" : "Register with Better Auth"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      <p className="relative z-10 shrink-0 px-4 pb-3 text-center text-[11px] text-gray-400 sm:pb-4 sm:text-xs">
        © {new Date().getFullYear()} SilidLMS. All rights reserved.
      </p>
    </div>
  );
}
