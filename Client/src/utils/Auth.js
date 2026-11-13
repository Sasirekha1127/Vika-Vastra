
export const getCustomerId = () => {
  try {
    const user     = JSON.parse(localStorage.getItem("user")     || "null");
    const customer = JSON.parse(localStorage.getItem("customer") || "null");
    return user?.id ?? customer?.id ?? null;
  } catch {
    return null;
  }
};

export const isLoggedIn = () => !!getCustomerId();