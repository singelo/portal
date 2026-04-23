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

async function login(password) {
    const body = new URLSearchParams();
    body.append("action", "login");
    body.append("password", password);

    console.log("POST login para:", API_URL);
    console.log("Payload:", body.toString());

    const res = await fetch(API_URL, {
        method: "POST",
        body
    });

    console.log("Status HTTP:", res.status);

    const text = await res.text();
    console.log("Resposta bruta da API:", text);

    let data;
    try {
        data = JSON.parse(text);
    } catch (e) {
        throw new Error("Resposta não é JSON válido: " + text);
    }

    if (!data.ok) {
        throw new Error(data.error || "Erro na API");
    }

    sessionStorage.setItem("rm_token", data.data.token);
    return true;
}

function logout() {
    sessionStorage.removeItem("rm_token");
}