export const pay = async (plan: "customer_plus" | "organizer_pro") => {
  const res = await fetch("http://localhost:5000/create-checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan }),
  });

  const data = await res.json();
  window.location.href = data.url;
};
