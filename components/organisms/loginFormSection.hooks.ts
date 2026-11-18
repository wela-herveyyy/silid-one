"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { signInAction, signUpAction } from "@/lib/domain/actions/auth.actions";
import { searchSchoolsAction } from "@/lib/domain/actions/schools.actions";
import type { SchoolOption } from "@/lib/entities/schools.type";

export function useLoginForm() {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "signin";
  const serverError = searchParams.get("error");
  const callbackURL = searchParams.get("callbackURL") || "/class";

  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [schoolQuery, setSchoolQuery] = useState("");
  const [schoolResults, setSchoolResults] = useState<SchoolOption[]>([]);
  const [schoolsLoading, setSchoolsLoading] = useState(false);
  const [schoolDropdownOpen, setSchoolDropdownOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<SchoolOption | null>(null);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      setSchoolsLoading(true);
      const res = await searchSchoolsAction(schoolQuery);
      if (!active) return;
      setSchoolsLoading(false);
      if (res.ok) {
        setSchoolResults(res.data);
      }
    }, 150);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [schoolQuery]);

  function selectSchool(school: SchoolOption) {
    setSelectedSchool(school);
    setSchoolQuery(school.name);
    setSchoolDropdownOpen(false);
  }

  function clearSchool() {
    setSelectedSchool(null);
    setSchoolQuery("");
    setSchoolDropdownOpen(true);
  }

  return {
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
    formAction: mode === "signup" ? signUpAction : signInAction,
    schoolQuery,
    setSchoolQuery,
    schoolResults,
    schoolsLoading,
    schoolDropdownOpen,
    setSchoolDropdownOpen,
    selectedSchool,
    selectSchool,
    clearSchool,
  };
}
