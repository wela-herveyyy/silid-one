"use server";

export async function subscribeUserAction(subscriptionJson: string) {
  return {
    ok: true as const,
    subscribed: Boolean(subscriptionJson),
  };
}

export async function unsubscribeUserAction() {
  return {
    ok: true as const,
    subscribed: false,
  };
}
