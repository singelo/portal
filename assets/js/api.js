const API_URL = 'https://script.google.com/macros/s/AKfycbz5U38Rr5SplH74c8Jg9A4HES1WZgj_w_9sYEX-EA7A11yco53wTtqznkfqkKItwAWh6Q/exec';

async function apiRequest(action, payload = {}, auth = true) {

  const token = sessionStorage.getItem("rm_token");

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      action,
      token: auth ? token : "",
      payload
    })
  });

  const data = await res.json();

  if (!data.ok) {
    throw new Error(data.error || "Erro na API");
  }

  return data.data;
}

async function login(password){

  const body = new URLSearchParams();
  body.append("action","login");
  body.append("password",password);

  const res = await fetch(API_URL,{
    method:"POST",
    body
  });

  const data = await res.json();

  if(!data.ok){
    throw new Error(data.error);
  }

  sessionStorage.setItem("rm_token",data.data.token);

  return true;
}

function logout() {
  sessionStorage.removeItem("rm_token");
}