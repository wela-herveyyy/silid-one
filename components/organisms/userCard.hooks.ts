"use client";

import { useTransition } from "react";
import { deleteUserAction } from "@/lib/domain/actions/users.actions";

export function useUserCardActions() {
  const [isPending, startTransition] = useTransition();

  const handleDelete = (id: string) => {
    const fd = new FormData();
    fd.set("id", id);
    startTransition(async () => {
      await deleteUserAction(fd);
    });
  };

  return { isPending, handleDelete };
}
